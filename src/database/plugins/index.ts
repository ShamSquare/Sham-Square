export interface IAuditFields {
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISoftDeleteFields {
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: string | null;
}

export const geoPointSchema = {
  type: 'Point',
  coordinates: [0, 0],
};

export const addressSnapshotSchema = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  country: '',
  postalCode: '',
  label: '',
  location: geoPointSchema,
};

export const paymentDetailsSchema = {
  method: 'COD',
  status: 'PENDING',
  transactionId: null,
  gatewayResponse: null,
  paidAt: null,
  refundedAt: null,
  refundAmount: 0,
};
