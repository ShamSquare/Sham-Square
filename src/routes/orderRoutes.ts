import { createCrudRoutes } from './routeFactory.ts';
import { orderController } from '../controllers/OrderController.ts';

export const orderRoutes = createCrudRoutes(orderController);
