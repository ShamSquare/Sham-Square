import { Schema, model, type Document, type Types } from 'mongoose';
import { CART_STATUS_VALUES, CartStatus } from '../enums/index.ts';
import { auditFieldsPlugin, softDeletePlugin } from '../plugins/index.ts';

export interface ICart extends Document {
  userId?: Types.ObjectId | null;
  sessionId?: string | null;
  status: CartStatus;
  couponCode?: string | null;
  couponId?: Types.ObjectId | null;
  currency: string;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
  expiresAt?: Date | null;
  convertedOrderId?: Types.ObjectId | null;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | null;
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    sessionId: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: CART_STATUS_VALUES,
      default: CartStatus.ACTIVE,
      index: true,
    },
    couponCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },
    couponId: {
      type: Schema.Types.ObjectId,
      ref: 'Coupon',
      default: null,
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      maxlength: 3,
    },
    subtotal: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
    itemCount: { type: Number, default: 0, min: 0 },
    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    convertedOrderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
  },
  {
    collection: 'carts',
    timestamps: true,
  }
);

cartSchema.plugin(auditFieldsPlugin);
cartSchema.plugin(softDeletePlugin);

cartSchema.index(
  { userId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      userId: { $type: 'objectId' },
      status: 'ACTIVE',
      isDeleted: { $ne: true },
    },
  }
);
cartSchema.index(
  { sessionId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      sessionId: { $type: 'string' },
      status: 'ACTIVE',
      isDeleted: { $ne: true },
    },
  }
);
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { status: 'EXPIRED' } });
cartSchema.index({ updatedAt: -1 });

export const Cart = model<ICart>('Cart', cartSchema);
