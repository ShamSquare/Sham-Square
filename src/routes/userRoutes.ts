/**
 * @openapi
 * /api/v1/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: Success
 */
import { Router } from 'express';
import { createCrudRoutes } from './routeFactory.js';
import { userController } from '../controllers/UserController.js';

export const userRoutes = createCrudRoutes(userController);
