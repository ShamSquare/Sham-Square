import { Schema, model, type Document, type Types } from 'mongoose';
import { auditFieldsPlugin, softDeletePlugin } from '../plugins/index.js';

export interface IWishlistItem {
  _id?: Types.ObjectId;
  productId: Types.ObjectId;
  variantId?: Types.ObjectId | null;
  addedAt: Date;
  note?: string;
}

export interface IWishlist extends Document {
  userId: Types.ObjectId;
  name: string;
  isDefault: boolean;
  items: IWishlistItem[];
  itemCount: number;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | null;
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const wishlistItemSchema = new Schema<IWishlistItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variantId: {
      type: Schema.Types.ObjectId,
      ref: 'ProductVariant',
      default: null,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
  },
  { _id: true }
);

const wishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      default: 'My Wishlist',
    },
    isDefault: {
      type: Boolean,
      default: true,
    },
    items: {
      type: [wishlistItemSchema],
      default: [],
      validate: {
        validator(v: IWishlistItem[]) {
          return v.length <= 500;
        },
        message: 'Wishlist cannot exceed 500 items',
      },
    },
    itemCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    collection: 'wishlists',
    timestamps: true,
  }
);

wishlistSchema.plugin(auditFieldsPlugin);
wishlistSchema.plugin(softDeletePlugin);

wishlistSchema.pre('save', function syncItemCount(this: IWishlist, next) {
  this.itemCount = this.items.length;
  next();
});

wishlistSchema.index({ userId: 1, isDefault: 1 });
wishlistSchema.index({ userId: 1, name: 1 }, { unique: true, partialFilterExpression: { isDeleted: { $ne: true } } });
wishlistSchema.index({ 'items.productId': 1 });

export const Wishlist = model<IWishlist>('Wishlist', wishlistSchema);
