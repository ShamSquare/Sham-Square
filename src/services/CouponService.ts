import { BaseService } from './BaseService';
import { couponRepository } from '../database/repositories/index';
import type { ICoupon } from '../database/models/index';
import { AppError } from '../utils/app-error.util';
import { getAdminClient } from '../database/supabase';

function normalizeDate(value: any): string | null {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const date = new Date(trimmed);
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
}

function validateCouponDates(startDate: any, endDate: any, isUpdate = false): string[] {
  const errors: string[] = [];

  if (!isUpdate || startDate !== undefined) {
    const normalizedStart = normalizeDate(startDate);
    if (!normalizedStart) {
      errors.push('تاريخ البداية (start_date) مطلوب');
    }
  }

  if (!isUpdate || endDate !== undefined) {
    const normalizedEnd = normalizeDate(endDate);
    if (!normalizedEnd) {
      errors.push('تاريخ الانتهاء (end_date) مطلوب');
    }

    const normalizedStart = normalizeDate(startDate);
    if (normalizedStart && normalizedEnd) {
      const start = new Date(normalizedStart);
      const end = new Date(normalizedEnd);
      if (end <= start) {
        errors.push('تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية');
      }
    }
  }

  return errors;
}

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

    const dateErrors = validateCouponDates(data.startDate, data.endDate, false);
    errors.push(...dateErrors);

    if (errors.length > 0) {
      throw new AppError(errors.join('; '), 400, 'VALIDATION_ERROR');
    }

    const normalizedStart = normalizeDate(data.startDate)!;
    const normalizedEnd = normalizeDate(data.endDate)!;

    return super.create({
      ...data,
      name: data.name!.trim(),
      code: data.code!.trim().toUpperCase(),
      startDate: normalizedStart,
      endDate: normalizedEnd,
    });
  }

  async updateById(id: string, data: Partial<ICoupon>): Promise<ICoupon | null> {
    if (data.name !== undefined && !data.name.trim()) {
      throw new AppError('Coupon name cannot be empty', 400, 'VALIDATION_ERROR');
    }
    if (data.code !== undefined && !data.code.trim()) {
      throw new AppError('Coupon code cannot be empty', 400, 'VALIDATION_ERROR');
    }

    const dateErrors = validateCouponDates(data.startDate, data.endDate, true);
    if (dateErrors.length > 0) {
      throw new AppError(dateErrors.join('; '), 400, 'VALIDATION_ERROR');
    }

    const sanitized: Record<string, any> = { ...data };
    if (data.name !== undefined) sanitized.name = data.name.trim();
    if (data.code !== undefined) sanitized.code = data.code.trim().toUpperCase();
    if (data.startDate !== undefined) sanitized.startDate = normalizeDate(data.startDate)!;
    if (data.endDate !== undefined) sanitized.endDate = normalizeDate(data.endDate)!;

    return super.updateById(id, sanitized);
  }
async calculateDiscount(
  code: string,
  orderAmount: number,
  userId?: string
): Promise<{
  valid: boolean;
  coupon: ICoupon;
  discount: number;
  finalTotal: number;
}> {
  const coupon = await this.findOne({
    code: code.trim().toUpperCase(),
  });

  if (!coupon) {
    throw new AppError(
      'Invalid coupon',
      400,
      'INVALID_COUPON'
    );
  }

  const now = new Date();

  if (coupon.startDate && new Date(coupon.startDate) > now) {
    throw new AppError(
      'Coupon has not started yet',
      400,
      'COUPON_NOT_STARTED'
    );
  }

  if (coupon.endDate && new Date(coupon.endDate) < now) {
    throw new AppError(
      'Coupon has expired',
      400,
      'COUPON_EXPIRED'
    );
  }

  if (
    coupon.minOrderAmount &&
    orderAmount < coupon.minOrderAmount
  ) {
    throw new AppError(
      'Minimum order amount not reached',
      400,
      'MIN_ORDER_AMOUNT'
    );
  }

  let discount = 0;

  switch (coupon.type) {
    case 'PERCENTAGE':
      discount = (orderAmount * coupon.value) / 100;

      if (
        coupon.maxDiscount &&
        discount > coupon.maxDiscount
      ) {
        discount = coupon.maxDiscount;
      }
      break;

    case 'FIXED':
      discount = coupon.value;
      break;

    case 'FREE_SHIPPING':
      discount = 0;
      break;
  }

  discount = Math.min(discount, orderAmount);

  return {
    valid: true,
    coupon,
    discount,
    finalTotal: orderAmount - discount,
  };
}

async incrementUsage(couponId: string): Promise<void> {
  const client = getAdminClient();
  const { error } = await client.rpc('increment_coupon_usage', { p_coupon_id: couponId });

  if (error) {
    const message = typeof error.message === 'string' ? error.message : 'Failed to increment coupon usage';
    throw new AppError(message, 400, 'COUPON_USAGE_FAILED');
  }
}
  
}

export const couponService = new CouponService();