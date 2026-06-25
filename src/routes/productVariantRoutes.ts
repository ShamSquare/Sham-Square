import { createCrudRoutes } from './routeFactory.ts';
import { productVariantController } from '../controllers/ProductVariantController.ts';

export const productVariantRoutes = createCrudRoutes(productVariantController);
