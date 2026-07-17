import { BaseService } from './BaseService';
import { couponRepository } from '../database/repositories/index';
import type { ICoupon } from '../database/models/index';

export class CouponService extends BaseService<ICoupon> {
  constructor() {
    super(couponRepository);
  }
}

export const couponService = new CouponService();
