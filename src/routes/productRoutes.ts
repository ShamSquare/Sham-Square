import { Router } from 'express';
import { productController } from '../controllers/ProductController';
import { protect } from '../middlewares/auth.middleware';
import { asyncHandler } from '../controllers/asyncHandler';

const router = Router();

// Public routes - products are publicly accessible for browsing
router.get('/', asyncHandler(productController.list.bind(productController)));
router.get('/:id', asyncHandler(productController.getById.bind(productController)));

// Protected routes - only authenticated users can create, update, and delete products
router.post('/', protect, asyncHandler(productController.create.bind(productController)));
router.put('/:id', protect, asyncHandler(productController.update.bind(productController)));
router.delete('/:id', protect, asyncHandler(productController.remove.bind(productController)));

export { router as productRoutes };
