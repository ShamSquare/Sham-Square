import { createCrudRoutes } from './routeFactory.js';
import { productVariantController } from '../controllers/ProductVariantController.js';

export const productVariantRoutes = createCrudRoutes(productVariantController);
