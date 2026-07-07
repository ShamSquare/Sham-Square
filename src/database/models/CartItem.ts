export interface ICartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  currency: string;
  productName: string;
  variantName: string;
  thumbnail?: string;
  vendorId?: string | null;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
