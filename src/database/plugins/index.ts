import { Schema, type Query, type Types } from 'mongoose';
import {
  PAYMENT_METHOD_VALUES,
  PAYMENT_STATUS_VALUES,
} from '../enums/index.ts';

export interface IAuditFields {
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISoftDeleteFields {
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | null;
}

/**
 * Adds createdBy / updatedBy alongside Mongoose timestamps.
 */
export function auditFieldsPlugin(schema: Schema): void {
  schema.add({
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  });

  schema.set('timestamps', true);
}

/**
 * Soft-delete plugin: sets isDeleted flag instead of physical removal.
 */
export function softDeletePlugin(schema: Schema): void {
  schema.add({
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  });

  const excludeDeleted = function (this: Query<unknown, unknown>) {
    if (this.getOptions().includeDeleted) return;
    this.where({ isDeleted: { $ne: true } });
  };

  schema.pre('find', excludeDeleted);
  schema.pre('findOne', excludeDeleted);
  schema.pre('findOneAndUpdate', excludeDeleted);
  schema.pre('countDocuments', excludeDeleted);

  schema.methods.softDelete = async function softDelete(
    deletedBy?: Types.ObjectId | null
  ) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy ?? null;
    return this.save({ validateBeforeSave: false });
  };

  schema.methods.restore = async function restore() {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
    return this.save({ validateBeforeSave: false });
  };

  schema.statics.findWithDeleted = function findWithDeleted(filter = {}) {
    return this.find(filter).setOptions({ includeDeleted: true });
  };

  schema.statics.findOneWithDeleted = function findOneWithDeleted(filter = {}) {
    return this.findOne(filter).setOptions({ includeDeleted: true });
  };
}

export const geoPointSchema = {
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
  },
  coordinates: {
    type: [Number],
    validate: {
      validator(v: number[]) {
        return (
          Array.isArray(v) &&
          v.length === 2 &&
          v[0] >= -180 &&
          v[0] <= 180 &&
          v[1] >= -90 &&
          v[1] <= 90
        );
      },
      message: 'Coordinates must be [longitude, latitude]',
    },
  },
};

export const addressSnapshotSchema = {
  fullName: { type: String, required: true, trim: true, maxlength: 120 },
  phone: { type: String, required: true, trim: true, maxlength: 20 },
  addressLine1: { type: String, required: true, trim: true, maxlength: 200 },
  addressLine2: { type: String, trim: true, maxlength: 200, default: '' },
  city: { type: String, required: true, trim: true, maxlength: 100 },
  state: { type: String, required: true, trim: true, maxlength: 100 },
  country: { type: String, required: true, trim: true, maxlength: 100 },
  postalCode: { type: String, required: true, trim: true, maxlength: 20 },
  label: { type: String, trim: true, maxlength: 50 },
  location: geoPointSchema,
};

export const paymentDetailsSchema = {
  method: {
    type: String,
    required: true,
    enum: PAYMENT_METHOD_VALUES,
    default: 'COD',
  },
  status: {
    type: String,
    required: true,
    enum: PAYMENT_STATUS_VALUES,
    default: 'PENDING',
  },
  transactionId: { type: String, trim: true, default: null },
  gatewayResponse: { type: Schema.Types.Mixed, default: null },
  paidAt: { type: Date, default: null },
  refundedAt: { type: Date, default: null },
  refundAmount: { type: Number, min: 0, default: 0 },
};

/** Multi-vendor placeholder — nullable until marketplace launch */
export const vendorScopeSchema = {
  vendorId: {
    type: Schema.Types.ObjectId,
    ref: 'Vendor',
    default: null,
    index: true,
  },
};

/** Warehouse placeholder — nullable until WMS launch */
export const warehouseScopeSchema = {
  warehouseId: {
    type: Schema.Types.ObjectId,
    ref: 'Warehouse',
    default: null,
    index: true,
  },
};
