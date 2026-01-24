import {
  ProductType,
  ProductCategory,
  ProductStatus,
} from "../libs/enums/products.enum";
import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema(
  {
    productStatus: {
      type: String,
      enum: ProductStatus,
      default: ProductStatus.DRAFT,
    },

    productName: {
      type: String,
      required: true,
    },

    productDesc: {
      type: String,
    },

    productSlug: {
      type: String,
      required: true,
    },

    productPrice: {
      type: Number,
      required: true,
    },

    productSalePrice: {
      type: Number,
    },

    productCategory: {
      type: String,
      enum: ProductCategory,
      required: true,
    },

    productType: {
      type: String,
      enum: ProductType,
      required: true,
    },

    productMaterial: {
      type: String,
    },

    productColor: {
      type: String,
      required: true,
    },

    productImages: {
      type: [String],
      default: [],
    },

    productStockCount: {
      type: Number,
      required: true,
    },

    productViews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

/* INDEXES */

// Unique product URL
ProductSchema.index({ productSlug: 1 }, { unique: true });

// Prevent duplicate products in same category
ProductSchema.index({ productName: 1, productCategory: 1 }, { unique: true });

// Shop filtering
ProductSchema.index({ productCategory: 1 });
ProductSchema.index({ productType: 1 });
ProductSchema.index({ productStatus: 1 });

// Common shop query
ProductSchema.index({ productCategory: 1, productStatus: 1 });

// Search
ProductSchema.index({ productName: "text" });

export default mongoose.model("Product", ProductSchema);
