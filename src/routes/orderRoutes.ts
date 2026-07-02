import { Router } from 'express';
import { orderController } from '../controllers/OrderController.ts';
import { asyncHandler } from '../controllers/asyncHandler.ts';
import { protect } from '../middlewares/auth.middleware.ts';

const router = Router();

router.get('/', asyncHandler(orderController.list.bind(orderController)));
router.get('/:id', asyncHandler(orderController.getById.bind(orderController)));
router.post('/', protect, asyncHandler(orderController.create.bind(orderController)));
router.put('/:id', protect, asyncHandler(orderController.update.bind(orderController)));
router.delete('/:id', protect, asyncHandler(orderController.remove.bind(orderController)));

export { router as orderRoutes };
