import { createCrudRoutes } from './routeFactory.ts';
import { auditLogController } from '../controllers/AuditLogController.ts';

export const auditLogRoutes = createCrudRoutes(auditLogController);
