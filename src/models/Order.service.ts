import { Member } from "../libs/types/member";
import {
  Order,
  OrderInquiry,
  OrderItemInput,
  OrderUpdateInput,
} from "../libs/types/order";
import OrderModel from "../schema/Order.model";
import OrderItemModel from "../schema/OrderItem.model";
import { shapeIntoMongooseObjectId } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { ClientSession, Types } from "mongoose";
import { OrderPaymentStatus, OrderStatus } from "../libs/enums/order.enum";
import MemberService from "./Member.service";
import ProductModel from "../schema/Product.model";
import { T } from "../libs/types/common";

class OrderService {
  private readonly orderModel;
  private readonly orderItemModel;
  private readonly productModel;
  private readonly memberService;

  constructor() {
    this.orderModel = OrderModel;
    this.orderItemModel = OrderItemModel;
    this.productModel = ProductModel;
    this.memberService = new MemberService();
  }

  public async createOrder(
    member: Member,
    input: OrderItemInput[],
  ): Promise<Order> {
    if (!input.length) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.NO_ITEM_FOUND);
    }

    const memberId = shapeIntoMongooseObjectId(member._id);
    const memberData = await this.memberService.getMemberDetail(memberId);
    console.log("member object:", memberData);
    console.log("member.memberAddress:", memberData.memberAddress);

    if (!memberData.memberAddress) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.NO_SHIPPING_ADDRESS);
    }
    const shippingAddress = { fullAddress: memberData.memberAddress };

    const session: ClientSession = await this.orderModel.startSession();
    session.startTransaction();

    try {
      let amount = 0;

      const preparedItems = [];

      for (const item of input) {
        const product = await this.productModel
          .findById(item.productId)
          .lean()
          .exec();

        if (!product) {
          throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        }

        const price = product.productPrice;
        amount += price * item.itemQuantity;

        preparedItems.push({
          itemQuantity: item.itemQuantity,
          itemPrice: price,
          productId: shapeIntoMongooseObjectId(item.productId),
        });
      }

      const delivery = amount < 150000 ? 10000 : 0;

      const [newOrder] = await this.orderModel.create(
        [
          {
            memberId,
            orderStatus: OrderStatus.PENDING,
            orderPaymentStatus: OrderPaymentStatus.UNPAID,
            orderShippingAddress: shippingAddress,
            orderTotal: amount + delivery,
            orderDelivery: delivery,
          },
        ],
        { session },
      );

      await this.recordOrderItem(newOrder._id, preparedItems, session);

      await session.commitTransaction();
      session.endSession();

      return newOrder.toObject() as Order;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  private async recordOrderItem(
    orderId: Types.ObjectId,
    items: Omit<OrderItemInput, "orderId">[],
    session: ClientSession,
  ): Promise<void> {
    await this.orderItemModel.insertMany(
      items.map((item) => ({
        ...item,
        orderId,
      })),
      { session },
    );
  }

  public async getMyOrders(
    member: Member,
    inquiry: OrderInquiry,
  ): Promise<Order[]> {
    const { page, limit, orderStatus, orderPaymentStatus } = inquiry,
      memberId = shapeIntoMongooseObjectId(member._id),
      match: T = { memberId };
    if (orderStatus) match.orderStatus = orderStatus;
    if (orderPaymentStatus) match.orderPaymentStatus = orderPaymentStatus;

    const result = await this.orderModel
      .aggregate([
        { $match: match },
        { $sort: { updatedAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
          $lookup: {
            from: "orderItems",
            localField: "_id",
            foreignField: "orderId",
            as: "orderItems",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "orderItems.productId",
            foreignField: "_id",
            as: "productData",
          },
        },
      ])
      .exec();

    if (!result.length) return [];

    return result;
  }

  public async updateOrder(
    member: Member,
    input: OrderUpdateInput,
  ): Promise<Order> {
    const memberId = shapeIntoMongooseObjectId(member._id),
      orderId = shapeIntoMongooseObjectId(input.orderId);

    const order = await this.orderModel.findOne({
      _id: orderId,
      memberId,
      isDeleted: false,
    });

    if (!order) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    /* checks */
    if (order.orderStatus === OrderStatus.CANCELLED)
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_STATUS_CHANGE);

    if (
      input.orderStatus === OrderStatus.SHIPPED &&
      order.orderPaymentStatus !== OrderPaymentStatus.PAID
    ) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.PAYMENT_REQUIRED);
    }

    const prevStatus = order.orderStatus;

    if (input.orderStatus) order.orderStatus = input.orderStatus;
    if (input.orderPaymentStatus)
      order.orderPaymentStatus = input.orderPaymentStatus;

    await order.save();

    /* Points added only once */
    if (
      prevStatus !== OrderStatus.SHIPPED &&
      order.orderStatus === OrderStatus.SHIPPED
    ) {
      await this.memberService.addUserPoints(member, 1);
    }

    /* Registering the sales for that product */
    if (
      prevStatus !== OrderStatus.DELIVERED &&
      order.orderStatus === OrderStatus.DELIVERED
    ) {
      const orderItems = await this.orderItemModel
        .find({ orderId: order._id })
        .exec();

      await this.productModel.bulkWrite(
        orderItems.map((item) => ({
          updateOne: {
            filter: { _id: item.productId },
            update: {
              $inc: {
                productSales: item.itemQuantity,
                productStockCount: -item.itemQuantity,
              },
            },
          },
        })),
      );
    }

    return order.toObject() as Order;
  }
}

export default OrderService;
