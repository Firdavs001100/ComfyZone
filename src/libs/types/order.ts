import { Types } from "mongoose";
import { OrderStatus, OrderPaymentStatus } from "../enums/order.enum";
import { Product } from "./product";

export interface OrderItemInput {
  itemQuantity: number;
  itemPrice: number;
  productId: Types.ObjectId;
  orderId?: Types.ObjectId;
}

export interface Order {
  _id: Types.ObjectId;
  memberId: Types.ObjectId;
  orderStatus: OrderStatus;
  orderPaymentStatus: OrderPaymentStatus;
  orderShippingAddress: Record<string, any>;
  orderTotal: number;
  orderDelivery: number;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // from aggregations
  orderItems?: OrderItem[];
  productData?: Product[];
}

export interface OrderItem {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  productId: Types.ObjectId;
  itemQuantity: number;
  itemPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderInquiry {
  page: number;
  limit: number;
  orderStatus?: OrderStatus;
  orderPaymentStatus?: OrderPaymentStatus;
}

export interface OrderUpdateInput {
  orderId: Types.ObjectId;
  orderStatus?: OrderStatus;
  orderPaymentStatus?: OrderPaymentStatus;
}
