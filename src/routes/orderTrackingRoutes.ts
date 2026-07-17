import { createCrudRoutes } from './routeFactory';
import { orderTrackingController } from '../controllers/OrderTrackingController';

export const orderTrackingRoutes = createCrudRoutes(orderTrackingController);
