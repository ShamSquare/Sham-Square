export interface ICategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  vendorId?: string | null;
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
