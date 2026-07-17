import { createCrudRoutes } from './routeFactory';
import { auditLogController } from '../controllers/AuditLogController';

export const auditLogRoutes = createCrudRoutes(auditLogController);
