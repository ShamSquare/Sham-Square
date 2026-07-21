import { CouponApplicability, CouponType } from '../enums/index';

export interface ICoupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: CouponType;
  value: number;
  maxDiscount?: number | null;
  minOrderAmount: number;
  usageLimit?: number | null;
  usageCount: number;
  perUserLimit: number;
  applicability: CouponApplicability;
  applicableCategoryIds: string[];
  applicableProductIds: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  vendorId?: string | null;
  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
