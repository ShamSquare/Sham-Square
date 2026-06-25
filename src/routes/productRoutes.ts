import { createCrudRoutes } from './routeFactory.ts';
import { productController } from '../controllers/ProductController.ts';

export const productRoutes = createCrudRoutes(productController);
