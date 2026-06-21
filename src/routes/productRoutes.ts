import { createCrudRoutes } from './routeFactory.js';
import { productController } from '../controllers/ProductController.js';

export const productRoutes = createCrudRoutes(productController);
