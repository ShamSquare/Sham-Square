import { createCrudRoutes } from './routeFactory.ts';
import { userController } from '../controllers/UserController.ts';

export const userRoutes = createCrudRoutes(userController);
