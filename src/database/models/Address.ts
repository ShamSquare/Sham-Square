import { AddressLabel } from '../enums/index.ts';

export interface IAddress {
  id: string;
  userId: string;
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
  deletedBy?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
