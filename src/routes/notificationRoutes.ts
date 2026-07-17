import { createCrudRoutes } from './routeFactory';
import { notificationController } from '../controllers/NotificationController';

export const notificationRoutes = createCrudRoutes(notificationController);
