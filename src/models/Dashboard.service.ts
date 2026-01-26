import MemberModel from "../schema/Member.model";
import ProviderModel from "../schema/Provider.model";
import ProductModel from "../schema/Product.model";

import { MemberStatus } from "../libs/enums/member.enum";
import { ProductStatus } from "../libs/enums/products.enum";

class DashboardService {
  private readonly memberModel;
  private readonly providerModel;
  private readonly productModel;

  constructor() {
    this.memberModel = MemberModel;
    this.providerModel = ProviderModel;
    this.productModel = ProductModel;
  }

  public async getDashboardData() {
    const [
      userStats,
      providerStats,
      productStats,
      categories,
      productTypes,
    ] = await Promise.all([
      // ===== USERS =====
      this.memberModel.aggregate([
        {
          $group: {
            _id: "$memberStatus",
            count: { $sum: 1 },
            totalPoints: { $sum: "$memberPoints" },
          },
        },
      ]),

      // ===== PROVIDERS =====
      this.providerModel.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            verified: {
              $sum: { $cond: [{ $eq: ["$isVerified", true] }, 1, 0] },
            },
            avgRating: { $avg: "$providerRating" },
          },
        },
      ]),

      // ===== PRODUCTS =====
      this.productModel.aggregate([
        {
          $group: {
            _id: "$productStatus",
            count: { $sum: 1 },
            totalViews: { $sum: "$productViews" },
            totalStock: { $sum: "$productStockCount" },
            totalPrice: { $sum: "$productPrice" },
            discounted: {
              $sum: { $cond: [{ $eq: ["$isDiscounted", true] }, 1, 0] },
            },
          },
        },
      ]),

      this.productModel.distinct("productCategory"),
      this.productModel.distinct("productType"),
    ]);

    // ===== USER METRICS =====
    const totalUsers = userStats.reduce((sum, u) => sum + u.count, 0);
    const totalUserPoints = userStats.reduce(
      (sum, u) => sum + u.totalPoints,
      0,
    );

    const activeUsers =
      userStats.find((u) => u._id === MemberStatus.ACTIVE)?.count || 0;
    const blockedUsers =
      userStats.find((u) => u._id === MemberStatus.BLOCK)?.count || 0;
    const deletedUsers =
      userStats.find((u) => u._id === MemberStatus.DELETE)?.count || 0;

    // ===== PROVIDER METRICS =====
    const providerData = providerStats[0] || {};
    const totalProviders = providerData.total || 0;
    const verifiedProviders = providerData.verified || 0;
    const averageProviderRating = Number(
      providerData.avgRating?.toFixed(1) || 0,
    );

    // ===== PRODUCT METRICS =====
    const totalProducts = productStats.reduce((s, p) => s + p.count, 0);
    const totalViews = productStats.reduce((s, p) => s + p.totalViews, 0);
    const totalStock = productStats.reduce((s, p) => s + p.totalStock, 0);
    const totalPrice = productStats.reduce((s, p) => s + p.totalPrice, 0);
    const discountedProducts = productStats.reduce(
      (s, p) => s + p.discounted,
      0,
    );

    const activeProducts =
      productStats.find((p) => p._id === ProductStatus.ACTIVE)?.count || 0;
    const draftProducts =
      productStats.find((p) => p._id === ProductStatus.DRAFT)?.count || 0;
    const outOfStockProducts =
      productStats.find((p) => p._id === ProductStatus.OUT_OF_STOCK)?.count || 0;

    const averageProductPrice =
      totalProducts > 0 ? Math.round(totalPrice / totalProducts) : 0;

    // ===== FINAL DASHBOARD OBJECT =====
    return {
      totalUsers,
      activeUsers,
      blockedUsers,
      deletedUsers,
      totalUserPoints,

      totalProviders,
      verifiedProviders,
      averageProviderRating,

      totalProducts,
      activeProducts,
      draftProducts,
      outOfStockProducts,
      totalViews,
      totalStock,
      discountedProducts,
      averageProductPrice,

      totalCategories: categories.filter(Boolean).length,
      totalProductTypes: productTypes.filter(Boolean).length,
    };
  }
}

export default DashboardService;
