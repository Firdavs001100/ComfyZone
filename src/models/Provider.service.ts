import {
  Provider,
  ProviderInput,
  ProviderInquiry,
  ProviderUpdateInput,
} from "../libs/types/provider";
import ProviderModel from "../schema/Provider.model";
import { ProductStatus } from "../libs/enums/products.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { PipelineStage } from "mongoose";
import { T } from "../libs/types/common";

class ProviderService {
  private readonly providerModel;

  constructor() {
    this.providerModel = ProviderModel;
  }

  // admin
  public async createProvider(input: ProviderInput): Promise<Provider> {
    try {
      const result = await this.providerModel.create(input);

      return result.toObject();
    } catch (err) {
      console.error("Error, model:createProvider:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async updateProvider(
    id: string,
    input: ProviderUpdateInput,
  ): Promise<Provider> {
    const _id = shapeIntoMongooseObjectId(id),
      result = await this.providerModel
        .findOneAndUpdate({ _id }, input, {
          new: true,
        })
        .lean<Provider>()
        .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    return result;
  }

  public async getProvidersByAdmin(): Promise<Provider[]> {
    const result = await this.providerModel.find().lean<Provider[]>().exec();
    if (!result.length)
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  // user
  public async getProvider(id: string): Promise<Provider> {
    const _id = shapeIntoMongooseObjectId(id);
    const result = await this.providerModel.aggregate([
      {
        $match: { _id },
      },
      {
        $lookup: {
          from: "products",
          let: { providerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$productProvider", "$$providerId"] },
                productStatus: ProductStatus.ACTIVE,
              },
            },
            {
              $addFields: {
                featuredScore: {
                  $add: [
                    { $multiply: ["$productSales", 0.5] },
                    { $multiply: ["$productRating", 10] },
                    { $multiply: ["$productTotalReviews", 0.2] },
                    { $cond: ["$isDiscounted", 5, 0] },
                  ],
                },
              },
            },
            { $sort: { featuredScore: -1 } },
            { $limit: 4 },
            {
              $project: {
                _id: 1,
                productName: 1,
                productPrice: 1,
                productSlug: 1,
                productImages: 1,
                featuredScore: 1,
              },
            },
          ],
          as: "featuredProducts",
        },
      },
    ]);

    if (!result.length)
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result[0];
  }

  public async getProviders(inquiry: ProviderInquiry): Promise<Provider[]> {
    const { order, page, limit, isVerified, providerCategory, search } =
      inquiry;

    const match: T = {
      ...(providerCategory && { providerCategory }),
      ...(isVerified && { isVerified }),
    };

    const pipeline = [
      ...(search
        ? [
            {
              $search: {
                index: "provider_autocomplete",
                autocomplete: {
                  query: search,
                  path: "providerName",
                },
              },
            },
          ]
        : []),
      { $match: match },
      {
        $sort:
          order === "providerRating" ? { providerRating: 1 } : { [order]: -1 },
      },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ] as PipelineStage[];

    return this.providerModel.aggregate(pipeline);
  }

  public async getTopProviders(): Promise<Provider[]> {
    try {
      const topProviders = await this.providerModel.aggregate([
        { $match: { isVerified: true } },
        {
          $lookup: {
            from: "products",
            let: { providerId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$productProvider", "$$providerId"] },
                  productStatus: ProductStatus.ACTIVE,
                },
              },
              {
                $addFields: {
                  featuredScore: {
                    $add: [
                      { $multiply: ["$productSales", 0.5] },
                      { $multiply: ["$productRating", 10] },
                      { $multiply: ["$productTotalReviews", 0.2] },
                      { $cond: ["$isDiscounted", 5, 0] },
                    ],
                  },
                },
              },
              { $sort: { featuredScore: -1 } },
              { $limit: 4 },
              {
                $project: {
                  _id: 1,
                  productName: 1,
                  productPrice: 1,
                  productSlug: 1,
                  productImages: 1,
                  featuredScore: 1,
                },
              },
            ],
            as: "featuredProducts",
          },
        },
        { $sort: { popularityScore: -1 } },
        { $limit: 4 },
      ]);

      return topProviders;
    } catch (err) {
      console.error("Error in getTopProviders:", err);
      throw err;
    }
  }
}

export default ProviderService;
