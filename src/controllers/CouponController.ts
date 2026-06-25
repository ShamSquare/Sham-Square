import { CrudController } from './CrudController.ts';
import { couponService } from '../services/index.ts';
import type { ICoupon } from '../database/models/index.ts';

export class CouponController extends CrudController<ICoupon> {
  constructor() {
    super(couponService);
  }
}

export const couponController = new CouponController();
