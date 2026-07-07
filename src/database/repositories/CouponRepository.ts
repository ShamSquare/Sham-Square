import { BaseRepository } from './BaseRepository.ts';
import type { ICoupon } from '../models/index.ts';

export class CouponRepository extends BaseRepository<ICoupon> {
  constructor() {
    super('coupons');
  }
}

export const couponRepository = new CouponRepository();
