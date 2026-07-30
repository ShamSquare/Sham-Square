import { Router } from 'express';
import { createCrudRoutes } from './routeFactory';
import { couponController } from '../controllers/CouponController';
import { asyncHandler } from '../controllers/asyncHandler';

const router = Router();

// أولاً سجل الـ validate
router.post(
  '/validate',
  asyncHandler(couponController.validate.bind(couponController))
);

// ثم أضف جميع CRUD routes
router.use('/', createCrudRoutes(couponController));

export const couponRoutes = router;