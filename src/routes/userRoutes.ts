import { createCrudRoutes } from './routeFactory';
import { userController } from '../controllers/UserController';

export const userRoutes = createCrudRoutes(userController);
