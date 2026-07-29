import { Router } from 'express';
import { orderController } from '../controllers/OrderController';
import { asyncHandler } from '../controllers/asyncHandler';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', protect, asyncHandler(orderController.list.bind(orderController)));
router.get('/:id', protect, asyncHandler(orderController.getById.bind(orderController)));
router.post('/', protect, asyncHandler(orderController.create.bind(orderController)));
router.put('/:id', protect, asyncHandler(orderController.update.bind(orderController)));
router.delete('/:id', protect, asyncHandler(orderController.remove.bind(orderController)));

export { router as orderRoutes };
