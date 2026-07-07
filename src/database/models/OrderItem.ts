import { OrderItemStatus } from '../enums/index.ts';

export interface IOrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  sku: string;
  productName: string;
  variantName: string;
  thumbnail?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  lineTotal: number;
  currency: string;
  status: OrderItemStatus;
  vendorId?: string | null;
  warehouseId?: string | null;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
