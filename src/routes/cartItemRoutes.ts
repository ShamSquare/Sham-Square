import { createCrudRoutes } from './routeFactory.ts';
import { cartItemController } from '../controllers/CartItemController.ts';

export const cartItemRoutes = createCrudRoutes(cartItemController);
