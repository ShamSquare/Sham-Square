import { OrderItemStatus } from '../enums/index';

export interface IOrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  sku: string;
  productName: string;
  variantName: string;
  thumbnail?: string;
  selectedColor?: string;
  selectedSize?: string;
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

// Alias for backward compatibility with snake_case field names
export interface IOrderItemDb extends IOrderItem {
  selected_color?: string;
  selected_size?: string;
}
