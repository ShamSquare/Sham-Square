import { createCrudRoutes } from './routeFactory.js';
import { cartController } from '../controllers/CartController.js';

export const cartRoutes = createCrudRoutes(cartController);
