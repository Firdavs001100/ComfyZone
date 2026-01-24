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
import { ObjectId } from "mongoose";
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
        runValidators: true,
      })
      .lean<Product>()
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    return result;
  }
}

export default ProductService;
