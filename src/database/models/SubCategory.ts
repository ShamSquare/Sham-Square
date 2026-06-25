import { Schema, model, type Document, type Types } from 'mongoose';
import { auditFieldsPlugin, softDeletePlugin } from '../plugins/index.ts';

export interface ISubCategory extends Document {
  categoryId: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
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

const subCategorySchema = new Schema<ISubCategory>(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
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
    sortOrder: {
      type: Number,
      default: 0,
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
    seo: {
      metaTitle: { type: String, trim: true, maxlength: 160 },
      metaDescription: { type: String, trim: true, maxlength: 320 },
    },
  },
  {
    collection: 'subcategories',
    timestamps: true,
  }
);

subCategorySchema.plugin(auditFieldsPlugin);
subCategorySchema.plugin(softDeletePlugin);

subCategorySchema.index({ categoryId: 1, slug: 1 }, { unique: true });
subCategorySchema.index({ categoryId: 1, isActive: 1, sortOrder: 1, isDeleted: 1 });
subCategorySchema.index({ vendorId: 1 }, { sparse: true });

export const SubCategory = model<ISubCategory>('SubCategory', subCategorySchema);
