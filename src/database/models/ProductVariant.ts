export interface IProductVariantInventory {
  quantity: number;
  reserved: number;
  lowStockThreshold: number;
  warehouseId?: string | null;
}

export interface IProductVariant {
  id: string;
  productId: string;
  vendorId?: string | null;
  sku: string;
  name: string;
  attributes: Map<string, string>;
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  currency: string;
  inventory: IProductVariantInventory;
  weight?: number;
  weightUnit?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  images: string[];
  barcode?: string;
  isDefault: boolean;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
