import { Schema, model, type Document, type Types } from 'mongoose';
import { ROLE_NAME_VALUES, RoleName } from '../enums/index.ts';
import { auditFieldsPlugin, softDeletePlugin } from '../plugins/index.ts';

export interface IPermission {
  resource: string;
  actions: string[];
}

export interface IRole extends Document {
  name: RoleName;
  displayName: string;
  description?: string;
  permissions: IPermission[];
  isSystemRole: boolean;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | null;
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const permissionSchema = new Schema<IPermission>(
  {
    resource: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64,
    },
    actions: {
      type: [String],
      required: true,
      validate: {
        validator(v: string[]) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one action is required per permission',
      },
    },
  },
  { _id: false }
);

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ROLE_NAME_VALUES,
      uppercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    permissions: {
      type: [permissionSchema],
      default: [],
    },
    isSystemRole: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    collection: 'roles',
    timestamps: true,
  }
);

roleSchema.plugin(auditFieldsPlugin);
roleSchema.plugin(softDeletePlugin);

roleSchema.index({ isActive: 1, isDeleted: 1 });

export const Role = model<IRole>('Role', roleSchema);
