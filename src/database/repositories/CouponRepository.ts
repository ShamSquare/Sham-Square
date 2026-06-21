import { BaseRepository } from './BaseRepository.js';
import { Coupon, type ICoupon } from '../models/index.js';

export class CouponRepository extends BaseRepository<ICoupon> {
  constructor() {
    super(Coupon);
  }
}

export const couponRepository = new CouponRepository();
