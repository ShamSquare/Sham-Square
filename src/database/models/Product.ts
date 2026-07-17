import { ProductStatus } from '../enums/index';

export interface IProductRatingAggregate {
  average: number;
  count: number;
  distribution: {
    one: number;
    two: number;
    three: number;
    four: number;
    five: number;
  };
}

export interface IProduct {
  id: string;
  categoryId: string;
  subCategoryId: string;
  vendorId?: string | null;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  brand?: string;
  tags: string[];
  images: string[];
  thumbnail?: string;
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  attributes: Map<string, string>;
  status: ProductStatus;
  isFeatured: boolean;
  rating: IProductRatingAggregate;
  totalSold: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
