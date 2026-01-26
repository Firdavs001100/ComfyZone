import {
  Provider,
  ProviderInput,
  ProviderUpdateInput,
} from "../libs/types/provider";
import ProviderModel from "../schema/Provider.model";
import { ProductStatus } from "../libs/enums/products.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { shapeIntoMongooseObjectId } from "../libs/config";

class ProviderService {
  private readonly providerModel;

  constructor() {
    this.providerModel = ProviderModel;
  }

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

  public async getProvider(id: string): Promise<Provider> {
    const _id = shapeIntoMongooseObjectId(id),
      result = await this.providerModel.findById(_id).lean<Provider>().exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  public async getProviders(): Promise<Provider[]> {
    const result = await this.providerModel.find().lean<Provider[]>().exec();
    if (!result.length)
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
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
              { $limit: 3 },
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
