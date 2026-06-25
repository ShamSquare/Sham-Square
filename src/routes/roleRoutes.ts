import { Router } from 'express';
import { createCrudRoutes } from './routeFactory.ts';
import { roleController } from '../controllers/RoleController.ts';

export const roleRoutes = createCrudRoutes(roleController);
