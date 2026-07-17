import { SettingGroup } from '../enums/index';

export interface ISetting {
  id: string;
  key: string;
  value: unknown;
  groupName: SettingGroup;
  description?: string;
  isPublic: boolean;
  isEncrypted: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
