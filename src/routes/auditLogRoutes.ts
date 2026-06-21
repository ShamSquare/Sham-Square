import { createCrudRoutes } from './routeFactory.js';
import { auditLogController } from '../controllers/AuditLogController.js';

export const auditLogRoutes = createCrudRoutes(auditLogController);
