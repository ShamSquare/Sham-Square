import { Schema, model, type Document, type Types } from 'mongoose';
import {
  COUPON_APPLICABILITY_VALUES,
  COUPON_TYPE_VALUES,
  CouponApplicability,
  CouponType,
} from '../enums/index.ts';
import { auditFieldsPlugin, softDeletePlugin } from '../plugins/index.ts';

export interface ICoupon extends Document {
  code: string;
  name: string;
  description?: string;
  type: CouponType;
  value: number;
  maxDiscount?: number | null;
  minOrderAmount: number;
  usageLimit?: number | null;
  usageCount: number;
  perUserLimit: number;
  applicability: CouponApplicability;
  applicableCategoryIds: Types.ObjectId[];
  applicableProductIds: Types.ObjectId[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  vendorId?: Types.ObjectId | null;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | null;
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      maxlength: 32,
      match: [/^[A-Z0-9_-]+$/, 'Coupon code must be alphanumeric'],
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    type: {
      type: String,
      enum: COUPON_TYPE_VALUES,
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      min: 0,
      default: null,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    usageLimit: {
      type: Number,
      min: 1,
      default: null,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    perUserLimit: {
      type: Number,
      default: 1,
      min: 1,
    },
    applicability: {
      type: String,
      enum: COUPON_APPLICABILITY_VALUES,
      default: CouponApplicability.ALL,
    },
    applicableCategoryIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
      default: [],
    },
    applicableProductIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
      default: [],
    },
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      default: null,
    },
  },
  {
    collection: 'coupons',
    timestamps: true,
  }
);

couponSchema.plugin(auditFieldsPlugin);
couponSchema.plugin(softDeletePlugin);

couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ isActive: 1, startDate: 1, endDate: 1, isDeleted: 1 });
couponSchema.index({ vendorId: 1 }, { sparse: true });

export const Coupon = model<ICoupon>('Coupon', couponSchema);
