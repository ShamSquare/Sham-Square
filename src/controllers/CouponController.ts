import { CrudController } from './CrudController';
import { couponService } from '../services/index';
import type { ICoupon } from '../database/models/index';
import { isValidUUID } from '../utils/uuid.util';

export class CouponController extends CrudController<ICoupon> {
  constructor() {
    super(couponService);
  }

  async update(req: any, res: any) {
    // Validate UUID format
    if (!isValidUUID(req.params.id)) {
      return this.sendError(res, 'Invalid coupon ID', 400);
    }

    const updated = await couponService.updateById(req.params.id, req.body);
    if (!updated) {
      return this.sendError(res, 'Coupon not found', 404);
    }
    return this.sendSuccess(res, updated);
  }

  async remove(req: any, res: any) {
    // Validate UUID format
    if (!isValidUUID(req.params.id)) {
      return this.sendError(res, 'Invalid coupon ID', 400);
    }

    await couponService.deleteById(req.params.id);
    return this.sendNoContent(res);
  }

  async validate(req: any, res: any): Promise<any> {
  const { code, orderAmount } = req.body;

  if (!code) {
    return this.sendError(res, 'Coupon code is required', 400);
  }

  const result = await couponService.calculateDiscount(
    code,
    Number(orderAmount || 0),
    req.user?.userId
  );

  return this.sendSuccess(res, result);
}
}

export const couponController = new CouponController();
