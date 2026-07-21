import { BaseService } from './BaseService';
import { couponRepository } from '../database/repositories/index';
import type { ICoupon } from '../database/models/index';
import { AppError } from '../utils/app-error.util';

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
}

export const couponService = new CouponService();