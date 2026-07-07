import { DevicePlatform, UserStatus } from '../enums/index.ts';

export interface IDeviceToken {
  token: string;
  platform: DevicePlatform;
  deviceId?: string;
  appVersion?: string;
  isActive: boolean;
  lastUsedAt: Date;
}

export interface IUser {
  id: string;
  email: string;
  phone?: string;
  passwordHash: string;
  roleId: string;
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
  vendorId?: string | null;
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
  deletedBy?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
