import { CartStatus } from '../enums/index.ts';

export interface ICart {
  id: string;
  userId?: string | null;
  sessionId?: string | null;
  status: CartStatus;
  couponCode?: string | null;
  couponId?: string | null;
  currency: string;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
  expiresAt?: Date | null;
  convertedOrderId?: string | null;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
