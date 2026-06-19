import { Schema, model, type Document, type Types } from 'mongoose';
import {
  BANNER_LINK_TYPE_VALUES,
  BANNER_PLATFORM_VALUES,
  BannerLinkType,
  BannerPlatform,
} from '../enums/index.js';
import { auditFieldsPlugin, softDeletePlugin } from '../plugins/index.js';

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  linkType: BannerLinkType;
  linkValue?: string | null;
  platform: BannerPlatform;
  position: string;
  sortOrder: number;
  startDate?: Date | null;
  endDate?: Date | null;
  isActive: boolean;
  clickCount: number;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | null;
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    mobileImage: {
      type: String,
      trim: true,
      default: null,
    },
    linkType: {
      type: String,
      enum: BANNER_LINK_TYPE_VALUES,
      default: BannerLinkType.NONE,
    },
    linkValue: {
      type: String,
      trim: true,
      default: null,
    },
    platform: {
      type: String,
      enum: BANNER_PLATFORM_VALUES,
      default: BannerPlatform.ALL,
      index: true,
    },
    position: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    clickCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    collection: 'banners',
    timestamps: true,
  }
);

bannerSchema.plugin(auditFieldsPlugin);
bannerSchema.plugin(softDeletePlugin);

bannerSchema.index({ platform: 1, position: 1, isActive: 1, sortOrder: 1, isDeleted: 1 });
bannerSchema.index({ startDate: 1, endDate: 1 });

export const Banner = model<IBanner>('Banner', bannerSchema);
