import { createCrudRoutes } from './routeFactory';
import { subCategoryController } from '../controllers/SubCategoryController';

export const subCategoryRoutes = createCrudRoutes(subCategoryController);
