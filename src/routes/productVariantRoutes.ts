import { createCrudRoutes } from './routeFactory';
import { productVariantController } from '../controllers/ProductVariantController';

export const productVariantRoutes = createCrudRoutes(productVariantController);
