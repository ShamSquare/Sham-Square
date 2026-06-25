/**
 * UserDevice Model
 * Manages FCM tokens for push notifications
 */

import { Schema, model, Document, Types } from 'mongoose';

export enum DeviceType {
  ANDROID = 'android',
  WEB = 'web',
  IOS = 'ios',
}

export interface IUserDevice extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  fcmToken: string;
  deviceType: DeviceType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userDeviceSchema = new Schema<IUserDevice>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fcmToken: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
    },
    deviceType: {
      type: String,
      enum: Object.values(DeviceType),
      default: DeviceType.WEB,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'user_devices',
  }
);

// Compound index for faster queries
userDeviceSchema.index({ userId: 1, isActive: 1 });
userDeviceSchema.index({ fcmToken: 1, isActive: 1 });

/**
 * Pre-save middleware
 */
userDeviceSchema.pre('save', async function (next) {
  try {
    // Deactivate other devices with same FCM token
    if (this.isModified('fcmToken')) {
      await model('UserDevice').updateMany(
        { fcmToken: this.fcmToken, _id: { $ne: this._id } },
        { isActive: false }
      );
    }
    next();
  } catch (error) {
    next(error as any);
  }
});

export default model<IUserDevice>('UserDevice', userDeviceSchema);
