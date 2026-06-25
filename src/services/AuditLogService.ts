import { BaseService } from './BaseService.ts';
import { auditLogRepository } from '../database/repositories/index.ts';
import type { IAuditLog } from '../database/models/index.ts';

export class AuditLogService extends BaseService<IAuditLog> {
  constructor() {
    super(auditLogRepository);
  }
}

export const auditLogService = new AuditLogService();
