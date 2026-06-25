import { createCrudRoutes } from './routeFactory.ts';
import { orderItemController } from '../controllers/OrderItemController.ts';

export const orderItemRoutes = createCrudRoutes(orderItemController);
