import { ProductStatus, CategoryType, Category } from '../enums/index';

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
  category: CategoryType;
  subCategory: string;
  vendorId?: string | null;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  brand?: string;
  tags: string[];
  stock: number;
  price: number;
  image?: string;
  images?: string[];
  thumbnail?: string;
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
