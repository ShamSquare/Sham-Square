import { createCrudRoutes } from './routeFactory.ts';
import { couponController } from '../controllers/CouponController.ts';

export const couponRoutes = createCrudRoutes(couponController);
