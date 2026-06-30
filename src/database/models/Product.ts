import { Schema, model, type Document, type Types } from 'mongoose';
import { PRODUCT_STATUS_VALUES, ProductStatus } from '../enums/index.ts';
import { auditFieldsPlugin, softDeletePlugin } from '../plugins/index.ts';

export interface IProductRatingAggregate {
  average: number;
  count: number;
  distribution: {
    one: number;
    two: number;
    three: number;
    four: number;
    five: number;
  };
}

export interface IProduct extends Document {
  categoryId: Types.ObjectId;
  subCategoryId: Types.ObjectId;
  vendorId?: Types.ObjectId | null;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  brand?: string;
  tags: string[];
  images: string[];
  thumbnail?: string;
  /** Denormalized price range for listing pages — authoritative price lives on variants */
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  attributes: Map<string, string>;
  status: ProductStatus;
  isFeatured: boolean;
  rating: IProductRatingAggregate;
  totalSold: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | null;
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const ratingAggregateSchema = {
  average: { type: Number, default: 0, min: 0, max: 5 },
  count: { type: Number, default: 0, min: 0 },
  distribution: {
    one: { type: Number, default: 0, min: 0 },
    two: { type: Number, default: 0, min: 0 },
    three: { type: Number, default: 0, min: 0 },
    four: { type: Number, default: 0, min: 0 },
    five: { type: Number, default: 0, min: 0 },
  },
};

const productSchema = new Schema<IProduct>(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    subCategoryId: {
      type: Schema.Types.ObjectId,
      ref: 'SubCategory',
      required: true,
      index: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 220,
    },
    description: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    brand: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator(v: string[]) {
          return v.length <= 50;
        },
        message: 'Maximum 50 tags allowed',
      },
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator(v: string[]) {
          return v.length >= 0 && v.length <= 20;
        },
        message: 'Maximum 20 images allowed',
      },
    },
    thumbnail: { type: String, trim: true, default: null },
    priceRange: {
      min: { type: Number, required: true, min: 0 },
      max: { type: Number, required: true, min: 0 },
      currency: { type: String, required: true, default: 'USD', uppercase: true, maxlength: 3 },
    },
    attributes: {
      type: Map,
      of: String,
      default: () => new Map(),
    },
    status: {
      type: String,
      enum: PRODUCT_STATUS_VALUES,
      default: ProductStatus.DRAFT,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    rating: {
      type: ratingAggregateSchema,
      default: () => ({
        average: 0,
        count: 0,
        distribution: { one: 0, two: 0, three: 0, four: 0, five: 0 },
      }),
    },
    totalSold: {
      type: Number,
      default: 0,
      min: 0,
    },
    seo: {
      metaTitle: { type: String, trim: true, maxlength: 160 },
      metaDescription: { type: String, trim: true, maxlength: 320 },
    },
  },
  {
    collection: 'products',
    timestamps: true,
  }
);

productSchema.plugin(auditFieldsPlugin);
productSchema.plugin(softDeletePlugin);

productSchema.index({ categoryId: 1, subCategoryId: 1, status: 1, isDeleted: 1 });
productSchema.index({ vendorId: 1, status: 1, isDeleted: 1 }, { sparse: true });
productSchema.index({ status: 1, isFeatured: 1, 'rating.average': -1 });
productSchema.index({ tags: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ createdAt: -1 });
productSchema.index({ totalSold: -1 });

export const Product = model<IProduct>('Product', productSchema);
