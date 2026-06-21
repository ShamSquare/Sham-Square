import { BaseService } from './BaseService.js';
import { couponRepository } from '../database/repositories/index.js';
import type { ICoupon } from '../database/models/index.js';

export class CouponService extends BaseService<ICoupon> {
  constructor() {
    super(couponRepository);
  }
}

export const couponService = new CouponService();
