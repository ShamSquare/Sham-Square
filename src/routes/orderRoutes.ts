import { createCrudRoutes } from './routeFactory.js';
import { orderController } from '../controllers/OrderController.js';

export const orderRoutes = createCrudRoutes(orderController);
