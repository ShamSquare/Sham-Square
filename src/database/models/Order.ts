import { Schema, model, type Document, type Types } from 'mongoose';
import { ORDER_STATUS_VALUES, OrderStatus } from '../enums/index.js';
import {
  addressSnapshotSchema,
  auditFieldsPlugin,
  paymentDetailsSchema,
  softDeletePlugin,
} from '../plugins/index.js';

export interface IOrderDelivery {
  agentId?: Types.ObjectId | null;
  assignedAt?: Date | null;
  estimatedDeliveryAt?: Date | null;
  deliveredAt?: Date | null;
  deliveryNotes?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  userId: Types.ObjectId;
  status: OrderStatus;
  payment: {
    method: string;
    status: string;
    transactionId?: string | null;
    gatewayResponse?: unknown;
    paidAt?: Date | null;
    refundedAt?: Date | null;
    refundAmount: number;
  };
  shippingAddress: Record<string, unknown>;
  billingAddress?: Record<string, unknown> | null;
  shippingAddressId?: Types.ObjectId | null;
  pricing: {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
    currency: string;
  };
  couponId?: Types.ObjectId | null;
  couponCode?: string | null;
  delivery: IOrderDelivery;
  customerNotes?: string;
  adminNotes?: string;
  cancelReason?: string;
  cancelledAt?: Date | null;
  /** Future multi-vendor: parent order groups vendor sub-orders */
  vendorId?: Types.ObjectId | null;
  isArchived: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | null;
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const deliverySchema = {
  agentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },
  assignedAt: { type: Date, default: null },
  estimatedDeliveryAt: { type: Date, default: null },
  deliveredAt: { type: Date, default: null },
  deliveryNotes: { type: String, trim: true, maxlength: 1000, default: '' },
};

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 32,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ORDER_STATUS_VALUES,
      default: OrderStatus.PENDING,
      index: true,
    },
    payment: {
      type: paymentDetailsSchema,
      required: true,
      default: () => ({ method: 'COD', status: 'PENDING', refundAmount: 0 }),
    },
    shippingAddress: {
      type: addressSnapshotSchema,
      required: true,
    },
    billingAddress: {
      type: addressSnapshotSchema,
      default: null,
    },
    shippingAddressId: {
      type: Schema.Types.ObjectId,
      ref: 'Address',
      default: null,
    },
    pricing: {
      subtotal: { type: Number, required: true, min: 0 },
      discount: { type: Number, default: 0, min: 0 },
      shipping: { type: Number, default: 0, min: 0 },
      tax: { type: Number, default: 0, min: 0 },
      total: { type: Number, required: true, min: 0 },
      currency: { type: String, default: 'USD', uppercase: true, maxlength: 3 },
    },
    couponId: {
      type: Schema.Types.ObjectId,
      ref: 'Coupon',
      default: null,
    },
    couponCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },
    delivery: {
      type: deliverySchema,
      default: () => ({}),
    },
    customerNotes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    cancelReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
    cancelledAt: { type: Date, default: null },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      default: null,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    collection: 'orders',
    timestamps: true,
  }
);

orderSchema.plugin(auditFieldsPlugin);
orderSchema.plugin(softDeletePlugin);

orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ userId: 1, status: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'delivery.agentId': 1, status: 1 });
orderSchema.index({ vendorId: 1, status: 1, createdAt: -1 }, { sparse: true });
orderSchema.index({ 'payment.status': 1, 'payment.method': 1 });
orderSchema.index({ createdAt: -1 });

export const Order = model<IOrder>('Order', orderSchema);
