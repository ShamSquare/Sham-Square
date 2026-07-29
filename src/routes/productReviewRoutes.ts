import { Router } from 'express';
import { createCrudRoutes } from './routeFactory';
import { productReviewController } from '../controllers/ProductReviewController';

const router = Router();

// Admin endpoint with joins (must come before the generic /:id route)
router.get('/admin-list', productReviewController.adminList.bind(productReviewController));

// Standard CRUD routes
const crudRouter = createCrudRoutes(productReviewController);
router.use('/', crudRouter);

export { router as productReviewRoutes };
