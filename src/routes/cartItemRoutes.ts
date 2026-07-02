import { Router } from 'express';
import { cartItemController } from '../controllers/CartItemController.ts';
import { asyncHandler } from '../controllers/asyncHandler.ts';
import { protect } from '../middlewares/auth.middleware.ts';

const router = Router();

router.get('/', asyncHandler(cartItemController.list.bind(cartItemController)));
router.get('/:id', asyncHandler(cartItemController.getById.bind(cartItemController)));
router.post('/', protect, asyncHandler(cartItemController.create.bind(cartItemController)));
router.put('/:id', protect, asyncHandler(cartItemController.update.bind(cartItemController)));
router.delete('/:id', protect, asyncHandler(cartItemController.remove.bind(cartItemController)));

export { router as cartItemRoutes };
