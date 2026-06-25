import { createCrudRoutes } from './routeFactory.ts';
import { cartController } from '../controllers/CartController.ts';

export const cartRoutes = createCrudRoutes(cartController);
