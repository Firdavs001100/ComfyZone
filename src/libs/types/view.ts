import { ObjectId } from "mongoose";
import { ViewGroup } from "../enums/views.enum";

export interface View {
  _id: ObjectId;
  viewGroup: ViewGroup;
  viewRefId: ObjectId;
  memberId: ObjectId;
  createdAt: Date;
  uptatedAt: Date;
}

export interface ViewInput {
  memberId: ObjectId;
  viewRefId: ObjectId;
  viewGroup: ViewGroup;
}
