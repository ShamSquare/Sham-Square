import { Router } from 'express';
import { cartItemController } from '../controllers/CartItemController';
import { asyncHandler } from '../controllers/asyncHandler';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', asyncHandler(cartItemController.list.bind(cartItemController)));
router.get('/:id', asyncHandler(cartItemController.getById.bind(cartItemController)));
router.post('/', protect, asyncHandler(cartItemController.create.bind(cartItemController)));
router.put('/:id', protect, asyncHandler(cartItemController.update.bind(cartItemController)));
router.delete('/:id', protect, asyncHandler(cartItemController.remove.bind(cartItemController)));

export { router as cartItemRoutes };
