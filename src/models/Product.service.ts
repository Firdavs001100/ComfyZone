import {
  Product,
  ProductInput,
  ProductInquiry,
  ProductUpdateInput,
} from "../libs/types/product";
import Errors, { HttpCode, Message } from "../libs/Errors";
import ProductModel from "../schema/Product.model";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { ProductStatus } from "../libs/enums/products.enum";
import { T } from "../libs/types/common";
import { ObjectId, PipelineStage } from "mongoose";
import ViewService from "./View.service";
import { ViewInput } from "../libs/types/view";
import { ViewGroup } from "../libs/enums/views.enum";
import slugify from "slugify";

class ProductService {
  private readonly productModel;
  private readonly viewService;

  constructor() {
    this.productModel = ProductModel;
    this.viewService = new ViewService();
  }

  /** SPA */
  public async getProducts(inquiry: ProductInquiry): Promise<Product[]> {
    const {
      order,
      page,
      limit,
      productCategory,
      productType,
      productProvider,
      search,
    } = inquiry;

    const match: T = {
      productStatus: ProductStatus.ACTIVE,
      ...(productCategory && { productCategory }),
      ...(productType && { productType }),
      ...(productProvider && {
        productProvider: shapeIntoMongooseObjectId(productProvider),
      }),
    };

    const pipeline = [
      ...(search
        ? [
            {
              $search: {
                index: "product_autocomplete",
                autocomplete: {
                  query: search,
                  path: "productName",
                },
              },
            },
          ]
        : []),
      { $match: match },
      {
        $sort: order === "productPrice" ? { productPrice: 1 } : { [order]: -1 },
      },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ] as PipelineStage[];

    return this.productModel.aggregate(pipeline);
  }

  public async getProduct(
    memberId: ObjectId | null,
    id: string,
  ): Promise<Product> {
    const productId = shapeIntoMongooseObjectId(id);

    // 1️⃣ Get product
    let result = await this.productModel
      .findOne({
        _id: productId,
        productStatus: ProductStatus.ACTIVE,
      })
      .lean<Product>()
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    // 2️⃣ If member is logged in, process view count
    if (memberId) {
      const input: ViewInput = {
        memberId,
        viewRefId: productId,
        viewGroup: ViewGroup.PRODUCT,
      };

      const existView = await this.viewService.checkViewExistence(input);

      // If user has NOT viewed this product before
      if (!existView) {
        console.log("PLANNING TO INSERT NEW VIEW");

        // Insert new view
        await this.viewService.insertMemberView(input);

        // Increase productViews by 1
        result = await this.productModel
          .findByIdAndUpdate(
            productId,
            { $inc: { productViews: 1 } },
            { new: true },
          )
          .lean<Product>()
          .exec();
      }
    }

    return result;
  }

  /** BSSR */
  public async getAllProducts(): Promise<Product[]> {
    const result = await this.productModel.find().lean<Product[]>().exec();
    return result;
  }

  public async createNewProduct(input: ProductInput): Promise<Product> {
    try {
      // Generate base slug from product name
      const baseSlug = slugify(input.productName, {
        lower: true,
        strict: true,
        trim: true,
      });

      let slug = baseSlug;
      let count = 1;

      while (await this.productModel.exists({ productSlug: slug })) {
        slug = `${baseSlug}-${count++}`;
      }

      const result = await this.productModel.create({
        ...input,
        productSlug: slug,
        ...(input.productSalePrice !== undefined && {
          isDiscounted: true,
        }),
      });

      return result.toObject();
    } catch (err) {
      console.error("Error, model:createNewProduct:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async updateChosenProduct(
    id: String,
    input: ProductUpdateInput,
  ): Promise<Product> {
    id = shapeIntoMongooseObjectId(id);
    if (input.productName) {
      input.productSlug = slugify(input.productName, {
        lower: true,
        strict: true,
      });
    }

    const result = await this.productModel
      .findOneAndUpdate({ _id: id }, input, {
        new: true,
      })
      .lean<Product>()
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    return result;
  }
}

export default ProductService;
