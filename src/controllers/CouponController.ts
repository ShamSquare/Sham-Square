import { CrudController } from './CrudController';
import { couponService } from '../services/index';
import type { ICoupon } from '../database/models/index';

export class CouponController extends CrudController<ICoupon> {
  constructor() {
    super(couponService);
  }
}

export const couponController = new CouponController();
