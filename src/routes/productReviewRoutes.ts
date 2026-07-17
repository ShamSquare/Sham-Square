import { createCrudRoutes } from './routeFactory';
import { productReviewController } from '../controllers/ProductReviewController';

export const productReviewRoutes = createCrudRoutes(productReviewController);
