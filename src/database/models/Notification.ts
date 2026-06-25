import { Schema, model, type Document, type Types } from 'mongoose';
import {
  NOTIFICATION_CHANNEL_VALUES,
  NOTIFICATION_DELIVERY_STATUS_VALUES,
  NOTIFICATION_TYPE_VALUES,
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationType,
} from '../enums/index.js';

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  channels: NotificationChannel[];
  deliveryStatus: NotificationDeliveryStatus;
  isRead: boolean;
  readAt?: Date | null;
  sentAt?: Date | null;
  expiresAt?: Date | null;
  failureReason?: string;
  createdAt: Date;
}


const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPE_VALUES,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    channels: {
      type: [String],
      enum: NOTIFICATION_CHANNEL_VALUES,
      default: [NotificationChannel.IN_APP],
    },
    deliveryStatus: {
      type: String,
      enum: NOTIFICATION_DELIVERY_STATUS_VALUES,
      default: NotificationDeliveryStatus.PENDING,
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: { type: Date, default: null },
    sentAt: { type: Date, default: null },
    expiresAt: {
      type: Date,
      default: null,
    },
    failureReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
  },
  {
    collection: 'notifications',
    timestamps: { createdAt: true, updatedAt: false },
  }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1, createdAt: -1 });
notificationSchema.index({ deliveryStatus: 1, createdAt: 1 });
notificationSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, partialFilterExpression: { expiresAt: { $type: 'date' } } }
);

export const Notification = model<INotification>(
  'Notification',
  notificationSchema
);
