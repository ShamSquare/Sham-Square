import { BaseRepository } from './BaseRepository';
import type { ICoupon } from '../models/index';

export class CouponRepository extends BaseRepository<ICoupon> {
  constructor() {
    super('coupons');
  }
}

export const couponRepository = new CouponRepository();
