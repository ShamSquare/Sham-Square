import { BaseService } from './BaseService';
import { couponRepository } from '../database/repositories/index';
import type { ICoupon } from '../database/models/index';
import { AppError } from '../utils/app-error.util';

export class CouponService extends BaseService<ICoupon> {
  constructor() {
    super(couponRepository);
  }

  async create(data: Partial<ICoupon>): Promise<ICoupon> {
    const errors: string[] = [];

    if (!data.name || !data.name.trim()) {
      errors.push('Coupon name is required');
    }

    if (!data.code || !data.code.trim()) {
      errors.push('Coupon code is required');
    }

    if (!data.type) {
      errors.push('Coupon type is required (PERCENTAGE, FIXED, or FREE_SHIPPING)');
    }

    if (data.value === undefined || data.value === null || data.value < 0) {
      errors.push('Coupon value is required and must be a positive number');
    }

    if (errors.length > 0) {
      throw new AppError(errors.join('; '), 400, 'VALIDATION_ERROR');
    }

    return super.create({
      ...data,
      name: data.name!.trim(),
      code: data.code!.trim().toUpperCase(),
    });
  }

  async updateById(id: string, data: Partial<ICoupon>): Promise<ICoupon | null> {
    if (data.name !== undefined && !data.name.trim()) {
      throw new AppError('Coupon name cannot be empty', 400, 'VALIDATION_ERROR');
    }
    if (data.code !== undefined && !data.code.trim()) {
      throw new AppError('Coupon code cannot be empty', 400, 'VALIDATION_ERROR');
    }
    return super.updateById(id, data);
  }
}

export const couponService = new CouponService();
