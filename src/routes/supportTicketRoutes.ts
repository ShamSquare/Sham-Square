import { createCrudRoutes } from './routeFactory';
import { supportTicketController } from '../controllers/SupportTicketController';

export const supportTicketRoutes = createCrudRoutes(supportTicketController);
