import { createCrudRoutes } from './routeFactory.js';
import { subCategoryController } from '../controllers/SubCategoryController.js';

export const subCategoryRoutes = createCrudRoutes(subCategoryController);
