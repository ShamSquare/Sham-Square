import { CrudController } from './CrudController.js';
import { couponService } from '../services/index.js';
import type { ICoupon } from '../database/models/index.js';

export class CouponController extends CrudController<ICoupon> {
  constructor() {
    super(couponService);
  }
}

export const couponController = new CouponController();
