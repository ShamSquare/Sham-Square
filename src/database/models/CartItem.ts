import { Schema, model, type Document, type Types } from 'mongoose';
import { auditFieldsPlugin, softDeletePlugin } from '../plugins/index.ts';

export interface ICartItem extends Document {
  cartId: Types.ObjectId;
  productId: Types.ObjectId;
  variantId: Types.ObjectId;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  currency: string;
  /** Snapshot fields for display when product changes */
  productName: string;
  variantName: string;
  thumbnail?: string;
  vendorId?: Types.ObjectId | null;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | null;
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    cartId: {
      type: Schema.Types.ObjectId,
      ref: 'Cart',
      required: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variantId: {
      type: Schema.Types.ObjectId,
      ref: 'ProductVariant',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 99,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      maxlength: 3,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    variantName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    thumbnail: { type: String, trim: true, default: null },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      default: null,
    },
  },
  {
    collection: 'cartItems',
    timestamps: true,
  }
);

cartItemSchema.plugin(auditFieldsPlugin);
cartItemSchema.plugin(softDeletePlugin);

cartItemSchema.pre('save', function computeLineTotal(next) {
  this.lineTotal = this.unitPrice * this.quantity;
  next();
});

cartItemSchema.index(
  { cartId: 1, variantId: 1 },
  { unique: true, partialFilterExpression: { isDeleted: { $ne: true } } }
);
cartItemSchema.index({ cartId: 1, isDeleted: 1 });
cartItemSchema.index({ productId: 1 });
cartItemSchema.index({ vendorId: 1 }, { sparse: true });

export const CartItem = model<ICartItem>('CartItem', cartItemSchema);
