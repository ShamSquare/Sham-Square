import { Schema, model, type Document, type Types } from 'mongoose';
import { auditFieldsPlugin, softDeletePlugin } from '../plugins/index.js';

export interface IProductReview extends Document {
  productId: Types.ObjectId;
  userId: Types.ObjectId;
  orderId?: Types.ObjectId | null;
  variantId?: Types.ObjectId | null;
  rating: number;
  title?: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  isHidden: boolean;
  helpfulCount: number;
  adminResponse?: {
    message: string;
    respondedBy: Types.ObjectId;
    respondedAt: Date;
  };
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | null;
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const productReviewSchema = new Schema<IProductReview>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    variantId: {
      type: Schema.Types.ObjectId,
      ref: 'ProductVariant',
      default: null,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator(v: string[]) {
          return v.length <= 5;
        },
        message: 'Maximum 5 review images allowed',
      },
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    adminResponse: {
      message: { type: String, trim: true, maxlength: 2000 },
      respondedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      respondedAt: { type: Date },
    },
  },
  {
    collection: 'productReviews',
    timestamps: true,
  }
);

productReviewSchema.plugin(auditFieldsPlugin);
productReviewSchema.plugin(softDeletePlugin);

productReviewSchema.index(
  { productId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { isDeleted: { $ne: true } } }
);
productReviewSchema.index({ productId: 1, isApproved: 1, isHidden: 1, createdAt: -1 });
productReviewSchema.index({ userId: 1, createdAt: -1 });
productReviewSchema.index({ rating: 1 });

export const ProductReview = model<IProductReview>(
  'ProductReview',
  productReviewSchema
);
