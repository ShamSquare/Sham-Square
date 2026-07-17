import { createCrudRoutes } from './routeFactory';
import { orderItemController } from '../controllers/OrderItemController';

export const orderItemRoutes = createCrudRoutes(orderItemController);
