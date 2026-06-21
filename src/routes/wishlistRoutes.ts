import { createCrudRoutes } from './routeFactory.js';
import { wishlistController } from '../controllers/WishlistController.js';

export const wishlistRoutes = createCrudRoutes(wishlistController);
