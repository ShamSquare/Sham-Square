import { BaseService } from './BaseService';
import { auditLogRepository } from '../database/repositories/index';
import type { IAuditLog } from '../database/models/index';

export class AuditLogService extends BaseService<IAuditLog> {
  constructor() {
    super(auditLogRepository);
  }
}

export const auditLogService = new AuditLogService();
