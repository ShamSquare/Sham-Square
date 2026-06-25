import { createCrudRoutes } from './routeFactory.ts';
import { categoryController } from '../controllers/CategoryController.ts';

export const categoryRoutes = createCrudRoutes(categoryController);
