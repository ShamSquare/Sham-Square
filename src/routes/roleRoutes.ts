import { Router } from 'express';
import { createCrudRoutes } from './routeFactory';
import { roleController } from '../controllers/RoleController';

export const roleRoutes = createCrudRoutes(roleController);
