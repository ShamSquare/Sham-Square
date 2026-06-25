import { createCrudRoutes } from './routeFactory.ts';
import { subCategoryController } from '../controllers/SubCategoryController.ts';

export const subCategoryRoutes = createCrudRoutes(subCategoryController);
