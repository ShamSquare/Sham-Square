import { createCrudRoutes } from './routeFactory';
import { couponController } from '../controllers/CouponController';

export const couponRoutes = createCrudRoutes(couponController);
