import { RoleName } from '../enums/index.ts';

export interface IPermission {
  resource: string;
  actions: string[];
}

export interface IRole {
  id: string;
  name: RoleName;
  displayName: string;
  description?: string;
  permissions: IPermission[];
  isSystemRole: boolean;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
