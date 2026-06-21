import { createCrudRoutes } from './routeFactory.js';
import { orderTrackingController } from '../controllers/OrderTrackingController.js';

export const orderTrackingRoutes = createCrudRoutes(orderTrackingController);
