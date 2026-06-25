import { Schema, model, type Document, type Types } from 'mongoose';
import { ADDRESS_LABEL_VALUES, AddressLabel } from '../enums/index.ts';
import {
  auditFieldsPlugin,
  geoPointSchema,
  softDeletePlugin,
} from '../plugins/index.ts';

export interface IAddress extends Document {
  userId: Types.ObjectId;
  label: AddressLabel;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  isDefault: boolean;
  deliveryInstructions?: string;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | null;
  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    label: {
      type: String,
      enum: ADDRESS_LABEL_VALUES,
      default: AddressLabel.HOME,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    addressLine1: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    addressLine2: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    postalCode: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    location: geoPointSchema,
    isDefault: {
      type: Boolean,
      default: false,
    },
    deliveryInstructions: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
  },
  {
    collection: 'addresses',
    timestamps: true,
  }
);

addressSchema.plugin(auditFieldsPlugin);
addressSchema.plugin(softDeletePlugin);

addressSchema.index({ userId: 1, isDefault: 1 });
addressSchema.index({ userId: 1, isDeleted: 1 });
addressSchema.index({ location: '2dsphere' }, { sparse: true });

export const Address = model<IAddress>('Address', addressSchema);
