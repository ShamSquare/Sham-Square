import { Schema, model, type Document, type Types } from 'mongoose';
import { ORDER_ITEM_STATUS_VALUES, OrderItemStatus } from '../enums/index.ts';
import { auditFieldsPlugin, softDeletePlugin } from '../plugins/index.ts';

export interface IOrderItem extends Document {
  orderId: Types.ObjectId;
  productId: Types.ObjectId;
  variantId: Types.ObjectId;
  sku: string;
  productName: string;
  variantName: string;
  thumbnail?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  lineTotal: number;
  currency: string;
  status: OrderItemStatus;
  vendorId?: Types.ObjectId | null;
  warehouseId?: Types.ObjectId | null;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | null;
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
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
    sku: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
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
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
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
    status: {
      type: String,
      enum: ORDER_ITEM_STATUS_VALUES,
      default: OrderItemStatus.PENDING,
      index: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      default: null,
    },
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: 'Warehouse',
      default: null,
    },
  },
  {
    collection: 'orderItems',
    timestamps: true,
  }
);

orderItemSchema.plugin(auditFieldsPlugin);
orderItemSchema.plugin(softDeletePlugin);

orderItemSchema.index({ orderId: 1, variantId: 1 });
orderItemSchema.index({ orderId: 1, isDeleted: 1 });
orderItemSchema.index({ productId: 1, createdAt: -1 });
orderItemSchema.index({ vendorId: 1, status: 1 }, { sparse: true });
orderItemSchema.index({ warehouseId: 1 }, { sparse: true });

export const OrderItem = model<IOrderItem>('OrderItem', orderItemSchema);
