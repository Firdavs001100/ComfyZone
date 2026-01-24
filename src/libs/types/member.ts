import { ObjectId } from "mongoose";
import { MemberStatus, MemberType } from "../enums/member.enum";
import { Request } from "express";
import { Session } from "express-session";

export interface Member {
  _id: ObjectId;
  memberType: MemberType;
  memberStatus: MemberStatus;
  memberNick: String;
  memberPhone: String;
  memberPassword?: String;
  memberImage?: String;
  memberPoints: String;
  memberAddress?: String;
  memberDesc?: String;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemberInput {
  input: Promise<string> & void;
  memberType?: MemberType;
  memberStatus?: MemberStatus;
  memberNick: String;
  memberPhone: String;
  memberPassword: String;
  memberImage?: String;
  memberPoints?: String;
  memberAddress?: String;
  memberDesc?: String;
}

export interface MemberUpdateInput {
  _id: ObjectId;
  memberStatus?: MemberStatus;
  memberNick?: String;
  memberPhone?: String;
  memberPassword?: String;
  memberImage?: String;
  memberPoints?: String;
  memberAddress?: String;
  memberDesc?: String;
}

export interface loginInput {
  memberNick: String;
  memberPassword: String;
}

export interface AdminRequest extends Request {
  member: Member;
  session: Session & { member: Member };
  file: Express.Multer.File;
  files: Express.Multer.File[];
}

export interface ExtendedRequest extends Request {
  member: Member;
  file: Express.Multer.File;
  files: Express.Multer.File[];
}
