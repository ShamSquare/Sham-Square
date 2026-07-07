export interface IWishlistItem {
  productId: string;
  variantId?: string | null;
  addedAt: Date;
  note?: string;
}

export interface IWishlist {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;
  items: IWishlistItem[];
  itemCount: number;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
