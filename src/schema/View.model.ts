import { ViewGroup } from "../libs/enums/views.enum";
import mongoose, { Schema } from "mongoose";

const viewSchema = new Schema(
  {
    viewGroup: {
      type: String,
      enum: ViewGroup,
      required: true,
    },
    viewRefId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    memberId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Member",
    },
  },
  { timestamps: true },
);

export default mongoose.model("View", viewSchema);
