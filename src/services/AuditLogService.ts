import { BaseService } from './BaseService.js';
import { auditLogRepository } from '../database/repositories/index.js';
import type { IAuditLog } from '../database/models/index.js';

export class AuditLogService extends BaseService<IAuditLog> {
  constructor() {
    super(auditLogRepository);
  }
}

export const auditLogService = new AuditLogService();
