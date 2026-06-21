import { Router } from 'express';
import { createCrudRoutes } from './routeFactory.js';
import { userController } from '../controllers/UserController.js';

export const userRoutes = createCrudRoutes(userController);
