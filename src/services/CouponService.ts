import { BaseService } from './BaseService.ts';
import { couponRepository } from '../database/repositories/index.ts';
import type { ICoupon } from '../database/models/index.ts';

export class CouponService extends BaseService<ICoupon> {
  constructor() {
    super(couponRepository);
  }
}

export const couponService = new CouponService();
