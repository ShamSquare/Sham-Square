import { Schema, model, type Document, type Types } from 'mongoose';
import { auditFieldsPlugin, softDeletePlugin } from '../plugins/index.js';

export interface IProductVariantInventory {
  quantity: number;
  reserved: number;
  lowStockThreshold: number;
  warehouseId?: Types.ObjectId | null;
}

export interface IProductVariant extends Document {
  productId: Types.ObjectId;
  vendorId?: Types.ObjectId | null;
  sku: string;
  name: string;
  attributes: Map<string, string>;
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  currency: string;
  inventory: IProductVariantInventory;
  weight?: number;
  weightUnit?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  images: string[];
  barcode?: string;
  isDefault: boolean;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | null;
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const inventorySchema = {
  quantity: { type: Number, required: true, min: 0, default: 0 },
  reserved: { type: Number, required: true, min: 0, default: 0 },
  lowStockThreshold: { type: Number, min: 0, default: 5 },
  warehouseId: {
    type: Schema.Types.ObjectId,
    ref: 'Warehouse',
    default: null,
    index: true,
  },
};

const productVariantSchema = new Schema<IProductVariant>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      default: null,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 64,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    attributes: {
      type: Map,
      of: String,
      default: () => new Map(),
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    compareAtPrice: {
      type: Number,
      min: 0,
      default: null,
    },
    costPrice: {
      type: Number,
      min: 0,
      default: null,
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      maxlength: 3,
    },
    inventory: {
      type: inventorySchema,
      required: true,
      default: () => ({
        quantity: 0,
        reserved: 0,
        lowStockThreshold: 5,
        warehouseId: null,
      }),
    },
    weight: { type: Number, min: 0, default: null },
    weightUnit: { type: String, trim: true, default: 'kg' },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
      unit: { type: String, trim: true, default: 'cm' },
    },
    images: {
      type: [String],
      default: [],
    },
    barcode: {
      type: String,
      trim: true,
      sparse: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    collection: 'productVariants',
    timestamps: true,
  }
);

productVariantSchema.plugin(auditFieldsPlugin);
productVariantSchema.plugin(softDeletePlugin);

productVariantSchema.index({ sku: 1 }, { unique: true });
productVariantSchema.index({ productId: 1, isActive: 1, isDeleted: 1 });
productVariantSchema.index({ productId: 1, isDefault: 1 });
productVariantSchema.index({ barcode: 1 }, { unique: true, sparse: true });
productVariantSchema.index({ vendorId: 1 }, { sparse: true });
productVariantSchema.index({ 'inventory.warehouseId': 1 }, { sparse: true });
productVariantSchema.index({
  productId: 1,
  'inventory.quantity': 1,
});

export const ProductVariant = model<IProductVariant>(
  'ProductVariant',
  productVariantSchema
);
