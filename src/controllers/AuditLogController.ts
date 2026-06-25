import { CrudController } from './CrudController.ts';
import { auditLogService } from '../services/index.ts';
import type { IAuditLog } from '../database/models/index.ts';

export class AuditLogController extends CrudController<IAuditLog> {
  constructor() {
    super(auditLogService);
  }
}

export const auditLogController = new AuditLogController();
