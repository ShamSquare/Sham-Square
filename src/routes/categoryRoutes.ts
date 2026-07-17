import { createCrudRoutes } from './routeFactory';
import { categoryController } from '../controllers/CategoryController';

export const categoryRoutes = createCrudRoutes(categoryController);
