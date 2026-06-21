import { createCrudRoutes } from './routeFactory.js';
import { productReviewController } from '../controllers/ProductReviewController.js';

export const productReviewRoutes = createCrudRoutes(productReviewController);
