import { CrudController } from './CrudController';
import { auditLogService } from '../services/index';
import type { IAuditLog } from '../database/models/index';

export class AuditLogController extends CrudController<IAuditLog> {
  constructor() {
    super(auditLogService);
  }
}

export const auditLogController = new AuditLogController();
