import { BaseRepository } from './BaseRepository.ts';
import { Coupon, type ICoupon } from '../models/index.ts';

export class CouponRepository extends BaseRepository<ICoupon> {
  constructor() {
    super(Coupon);
  }
}

export const couponRepository = new CouponRepository();
