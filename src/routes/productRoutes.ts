import { Router } from 'express';
import { productController } from '../controllers/ProductController';
import { protect } from '../middlewares/auth.middleware';
import { asyncHandler } from '../controllers/asyncHandler';

const router = Router();

// All product routes require authentication so DEPARTMENT_ADMIN filtering can be enforced
router.get('/', protect, asyncHandler(productController.list.bind(productController)));
router.get('/:id', protect, asyncHandler(productController.getById.bind(productController)));
router.post('/', protect, asyncHandler(productController.create.bind(productController)));
router.put('/:id', protect, asyncHandler(productController.update.bind(productController)));
router.delete('/:id', protect, asyncHandler(productController.remove.bind(productController)));

export { router as productRoutes };