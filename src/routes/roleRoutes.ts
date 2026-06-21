import { Router } from 'express';
import { createCrudRoutes } from './routeFactory.js';
import { roleController } from '../controllers/RoleController.js';

export const roleRoutes = createCrudRoutes(roleController);
