import { createCrudRoutes } from './routeFactory.ts';
import { orderTrackingController } from '../controllers/OrderTrackingController.ts';

export const orderTrackingRoutes = createCrudRoutes(orderTrackingController);
