import { OrderStatus } from '../enums/index';

export interface IOrderDelivery {
  agentId?: string | null;
  assignedAt?: Date | null;
  estimatedDeliveryAt?: Date | null;
  deliveredAt?: Date | null;
  deliveryNotes?: string;
}

export interface IOrder {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  payment: {
    method: string;
    status: string;
    transactionId?: string | null;
    gatewayResponse?: unknown;
    paidAt?: Date | null;
    refundedAt?: Date | null;
    refundAmount: number;
  };
  shippingAddress: Record<string, unknown>;
  billingAddress?: Record<string, unknown> | null;
  shippingAddressId?: string | null;
  addressId?: string | null;
  pricing: {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
    currency: string;
  };
  couponId?: string | null;
  couponCode?: string | null;
  delivery: IOrderDelivery;
  customerNotes?: string;
  adminNotes?: string;
  cancelReason?: string;
  cancelledAt?: Date | null;
  vendorId?: string | null;
  isArchived: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
