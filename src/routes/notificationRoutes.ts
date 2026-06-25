import { createCrudRoutes } from './routeFactory.ts';
import { notificationController } from '../controllers/NotificationController.ts';

export const notificationRoutes = createCrudRoutes(notificationController);
