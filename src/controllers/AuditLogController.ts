import { CrudController } from './CrudController.js';
import { auditLogService } from '../services/index.js';
import type { IAuditLog } from '../database/models/index.js';

export class AuditLogController extends CrudController<IAuditLog> {
  constructor() {
    super(auditLogService);
  }
}

export const auditLogController = new AuditLogController();
