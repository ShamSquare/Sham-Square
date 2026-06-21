import { createCrudRoutes } from './routeFactory.js';
import { categoryController } from '../controllers/CategoryController.js';

export const categoryRoutes = createCrudRoutes(categoryController);
