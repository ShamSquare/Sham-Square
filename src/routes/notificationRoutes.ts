import { createCrudRoutes } from './routeFactory.js';
import { notificationController } from '../controllers/NotificationController.js';

export const notificationRoutes = createCrudRoutes(notificationController);
