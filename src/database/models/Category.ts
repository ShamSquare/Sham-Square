import { Schema, model, type Document, type Types } from 'mongoose';
import { auditFieldsPlugin, softDeletePlugin } from '../plugins/index.js';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  /** Future multi-vendor: null = platform-wide category */
  vendorId?: Types.ObjectId | null;
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

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 140,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    image: { type: String, trim: true, default: null },
    icon: { type: String, trim: true, default: null },
    sortOrder: {
      type: Number,
      default: 0,
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
      index: true,
    },
    seo: {
      metaTitle: { type: String, trim: true, maxlength: 160 },
      metaDescription: { type: String, trim: true, maxlength: 320 },
    },
  },
  {
    collection: 'categories',
    timestamps: true,
  }
);

categorySchema.plugin(auditFieldsPlugin);
categorySchema.plugin(softDeletePlugin);

categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ isActive: 1, sortOrder: 1, isDeleted: 1 });
categorySchema.index({ vendorId: 1, isActive: 1 }, { sparse: true });

export const Category = model<ICategory>('Category', categorySchema);
