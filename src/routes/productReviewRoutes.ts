import { createCrudRoutes } from './routeFactory.ts';
import { productReviewController } from '../controllers/ProductReviewController.ts';

export const productReviewRoutes = createCrudRoutes(productReviewController);
