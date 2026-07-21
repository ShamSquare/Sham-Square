export interface IDepartment {
  id: string;
  name: string;
  nameAr: string;
  description?: string;
  supervisorId?: string | null;
  adminIds: string[];
  productCount: number;
  orderCount: number;
  revenue: number;
  isActive: boolean;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: string | null;
}
