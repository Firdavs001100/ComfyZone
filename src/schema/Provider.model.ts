import mongoose, { Schema } from "mongoose";

const ProviderSchema = new Schema(
  {
    providerName: {
      type: String,
      required: true,
    },
    providerDesc: {
      type: String,
    },
    providerLogo: {
      type: String,
    },
    providerRating: {
      type: Number,
      default: 0,
    },
    providerTotalReviews: {
      type: Number,
      default: 0,
    },
    providerCategories: {
      type: [String],
      default: [],
    },
    providerPopularityScore: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Provider", ProviderSchema);
