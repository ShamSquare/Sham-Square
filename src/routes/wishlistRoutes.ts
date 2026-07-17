import { createCrudRoutes } from './routeFactory';
import { wishlistController } from '../controllers/WishlistController';

export const wishlistRoutes = createCrudRoutes(wishlistController);
