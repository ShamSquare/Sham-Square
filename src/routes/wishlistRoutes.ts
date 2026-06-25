import { createCrudRoutes } from './routeFactory.ts';
import { wishlistController } from '../controllers/WishlistController.ts';

export const wishlistRoutes = createCrudRoutes(wishlistController);
