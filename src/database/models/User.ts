import { Schema, model, type Document, type Types } from 'mongoose';
import {
  DEVICE_PLATFORM_VALUES,
  DevicePlatform,
  USER_STATUS_VALUES,
  UserStatus,
} from '../enums/index.ts';
import { auditFieldsPlugin, softDeletePlugin } from '../plugins/index.ts';

export interface IDeviceToken {
  token: string;
  platform: DevicePlatform;
  deviceId?: string;
  appVersion?: string;
  isActive: boolean;
  lastUsedAt: Date;
}

export interface IUser extends Document {
  email: string;
  phone?: string;
  passwordHash: string;
  roleId: Types.ObjectId;
  firstName: string;
  lastName: string;
  avatar?: string;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  emailVerifiedAt?: Date | null;
  phoneVerifiedAt?: Date | null;
  lastLoginAt?: Date | null;
  lastLoginIp?: string;
  deviceTokens: IDeviceToken[];
  /** Future multi-vendor: set when user is a vendor staff member */
  vendorId?: Types.ObjectId | null;
  /** Delivery agents only */
  deliveryProfile?: {
    isAvailable: boolean;
    vehicleType?: string;
    licenseNumber?: string;
    currentLocation?: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
  metadata: Record<string, unknown>;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | null;
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const deviceTokenSchema = new Schema<IDeviceToken>(
  {
    token: { type: String, required: true, trim: true },
    platform: {
      type: String,
      required: true,
      enum: DEVICE_PLATFORM_VALUES,
    },
    deviceId: { type: String, trim: true },
    appVersion: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    lastUsedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    phone: {
      type: String,
      trim: true,
      sparse: true,
      maxlength: 20,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64,
    },
    avatar: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: USER_STATUS_VALUES,
      default: UserStatus.ACTIVE,
      index: true,
    },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date, default: null },
    phoneVerifiedAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    lastLoginIp: { type: String, trim: true, default: null },
    deviceTokens: {
      type: [deviceTokenSchema],
      default: [],
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      default: null,
      index: true,
    },
    deliveryProfile: {
      isAvailable: { type: Boolean, default: false },
      vehicleType: { type: String, trim: true },
      licenseNumber: { type: String, trim: true },
      currentLocation: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: { type: [Number], default: undefined },
      },
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    collection: 'users',
    timestamps: true,
  }
);

userSchema.plugin(auditFieldsPlugin);
userSchema.plugin(softDeletePlugin);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });
userSchema.index({ roleId: 1, status: 1, isDeleted: 1 });
userSchema.index({ vendorId: 1, isDeleted: 1 }, { sparse: true });
userSchema.index({ 'deviceTokens.token': 1 }, { sparse: true });
userSchema.index({ 'deliveryProfile.currentLocation': '2dsphere' }, { sparse: true });
userSchema.index({ createdAt: -1 });

export const User = model<IUser>('User', userSchema);
