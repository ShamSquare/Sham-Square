export enum DeviceType {
  ANDROID = 'android',
  WEB = 'web',
  IOS = 'ios',
}

export interface IUserDevice {
  id: string;
  userId: string;
  fcmToken: string;
  deviceType: DeviceType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
