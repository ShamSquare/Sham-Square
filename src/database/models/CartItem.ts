export interface ICartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  currency: string;
  productName: string;
  variantName: string;
  thumbnail?: string;
  selectedColor?: string;
  selectedSize?: string;
  vendorId?: string | null;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
