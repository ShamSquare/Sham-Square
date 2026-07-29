export interface IAddress {
  id: string;
  userId: string;

  // Contact information
  fullName: string;
  phone: string;

  // Location hierarchy
  country: string;
  city: string;
  area: string;
  street: string;
  building: string;
  floor: string;
  apartment: string;
  postalCode: string;

  // Optional
  notes: string;
  latitude?: number | null;
  longitude?: number | null;

  // Flags
  isDefault: boolean;

  // Soft delete & audit
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
