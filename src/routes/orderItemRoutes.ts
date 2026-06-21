import { createCrudRoutes } from './routeFactory.js';
import { orderItemController } from '../controllers/OrderItemController.js';

export const orderItemRoutes = createCrudRoutes(orderItemController);
