import { createCrudRoutes } from './routeFactory';
import { productController } from '../controllers/ProductController';

export const productRoutes = createCrudRoutes(productController);
