import { Schema, model, type Document, type Types } from 'mongoose';
import {
  ORDER_STATUS_VALUES,
  OrderStatus,
  TRACKING_EVENT_SOURCE_VALUES,
  TrackingEventSource,
} from '../enums/index.js';

export interface IOrderTracking extends Document {
  orderId: Types.ObjectId;
  status: OrderStatus;
  title: string;
  message?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  locationLabel?: string;
  source: TrackingEventSource;
  metadata: Record<string, unknown>;
  createdBy?: Types.ObjectId | null;
  createdAt: Date;
}

const orderTrackingSchema = new Schema<IOrderTracking>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ORDER_STATUS_VALUES,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: { type: [Number] },
    },
    locationLabel: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },
    source: {
      type: String,
      enum: TRACKING_EVENT_SOURCE_VALUES,
      default: TrackingEventSource.SYSTEM,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    collection: 'orderTracking',
    timestamps: { createdAt: true, updatedAt: false },
  }
);

orderTrackingSchema.index({ orderId: 1, createdAt: -1 });
orderTrackingSchema.index({ orderId: 1, status: 1, createdAt: -1 });
orderTrackingSchema.index({ createdAt: -1 });

export const OrderTracking = model<IOrderTracking>(
  'OrderTracking',
  orderTrackingSchema
);
