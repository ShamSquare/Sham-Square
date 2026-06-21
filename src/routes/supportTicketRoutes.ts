import { createCrudRoutes } from './routeFactory.js';
import { supportTicketController } from '../controllers/SupportTicketController.js';

export const supportTicketRoutes = createCrudRoutes(supportTicketController);
