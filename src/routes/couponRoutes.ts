import { createCrudRoutes } from './routeFactory.js';
import { couponController } from '../controllers/CouponController.js';

export const couponRoutes = createCrudRoutes(couponController);
