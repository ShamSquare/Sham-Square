import { createCrudRoutes } from './routeFactory.ts';
import { cartController } from '../controllers/CartController.ts';
import { asyncHandler } from '../controllers/asyncHandler.ts';
import { protect } from '../middlewares/auth.middleware.ts';

const router = createCrudRoutes(cartController);

// convert active cart for authenticated user
router.post('/convert', protect, asyncHandler(cartController.convertActive.bind(cartController)));

export { router as cartRoutes };
