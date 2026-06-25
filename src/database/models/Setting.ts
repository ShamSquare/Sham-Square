import { Schema, model, type Document, type Types } from 'mongoose';
import { SETTING_GROUP_VALUES, SettingGroup } from '../enums/index.ts';
import { auditFieldsPlugin, softDeletePlugin } from '../plugins/index.ts';

export interface ISetting extends Document {
  key: string;
  value: unknown;
  group: SettingGroup;
  description?: string;
  isPublic: boolean;
  isEncrypted: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | null;
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const settingSchema = new Schema<ISetting>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 128,
      match: [/^[a-z][a-z0-9._-]*$/, 'Setting key must be lowercase dot-notation'],
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    group: {
      type: String,
      enum: SETTING_GROUP_VALUES,
      default: SettingGroup.GENERAL,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    isEncrypted: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: 'settings',
    timestamps: true,
  }
);

settingSchema.plugin(auditFieldsPlugin);
settingSchema.plugin(softDeletePlugin);

settingSchema.index({ key: 1 }, { unique: true });
settingSchema.index({ group: 1, isPublic: 1, isDeleted: 1 });

export const Setting = model<ISetting>('Setting', settingSchema);
