import { createCrudRoutes } from './routeFactory.ts';
import { supportTicketController } from '../controllers/SupportTicketController.ts';

export const supportTicketRoutes = createCrudRoutes(supportTicketController);
