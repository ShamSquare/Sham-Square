import { createCrudRoutes } from './routeFactory';
import { cartController } from '../controllers/CartController';
import { asyncHandler } from '../controllers/asyncHandler';
import { protect } from '../middlewares/auth.middleware';

const router = createCrudRoutes(cartController);

// convert active cart for authenticated user
router.post('/convert', protect, asyncHandler(cartController.convertActive.bind(cartController)));

export { router as cartRoutes };
