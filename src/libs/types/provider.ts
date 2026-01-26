import { ObjectId } from "mongoose";

export interface FeaturedProduct {
  _id: ObjectId;
  productName: string;
  productPrice: number;
  productSlug: string;
  productImages: string[];
  featuredScore: number;
}

export interface Provider {
  _id: ObjectId;
  providerName: string;
  providerDesc?: string;
  providerLogo?: string;
  providerRating: number;
  providerTotalReviews: number;
  providerCategories: string[];
  providerPopularityScore: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;

  // from aggregation
  featuredProducts?: FeaturedProduct[];
}

export interface ProviderInput {
  providerName: string;
  providerDesc?: string;
  providerLogo?: string;
  providerCategories?: string[];
}

export interface ProviderUpdateInput {
  _id: ObjectId;
  providerName?: string;
  providerDesc?: string;
  providerLogo?: string;
  providerRating?: number;
  providerTotalReviews?: number;
  providerCategories?: string[];
  providerPopularityScore?: number;
  isVerified?: boolean;
}

export interface ProviderInquiry {
  order: string;
  page: number;
  limit: number;
  isVerified?: boolean;
  providerCategory?: string;
  search?: string;
}
