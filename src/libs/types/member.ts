import { Types } from "mongoose";
import { MemberStatus, MemberType } from "../enums/member.enum";
import { Request } from "express";
import { Session } from "express-session";

/* === Core Member === */
export interface Member {
  _id: Types.ObjectId;
  memberType: MemberType;
  memberStatus: MemberStatus;
  memberNick: string;
  memberPhone: string;
  memberEmail: string;
  memberPassword?: string;
  memberImage?: string;
  memberPoints: number;
  memberAddress?: string;
  memberDesc?: string;
  createdAt: Date;
  updatedAt: Date;
}

/* === Inputs === */
export interface MemberInput {
  memberType?: MemberType;
  memberStatus?: MemberStatus;
  memberNick: string;
  memberPhone: string;
  memberEmail: string;
  memberPassword: string;
  memberImage?: string;
  memberPoints?: number;
  memberAddress?: string;
  memberDesc?: string;
}

export interface MemberUpdateInput {
  _id: Types.ObjectId;
  memberStatus?: MemberStatus;
  memberNick?: string;
  memberPhone?: string;
  memberEmail?: string;
  memberPassword?: string;
  memberImage?: string;
  memberPoints?: number;
  memberAddress?: string;
  memberDesc?: string;
}

export interface LoginInput {
  memberNick: string;
  memberPassword: string;
}

/* === Requests === */
export interface AdminRequest extends Request {
  member: Member;
  session: Session & { member?: Member };
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

export interface ExtendedRequest extends Request {
  member: Member;
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}
