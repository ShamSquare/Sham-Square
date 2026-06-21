import { createCrudRoutes } from './routeFactory.js';
import { cartItemController } from '../controllers/CartItemController.js';

export const cartItemRoutes = createCrudRoutes(cartItemController);
