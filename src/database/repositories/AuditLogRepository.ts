import { BaseRepository } from './BaseRepository';
import type { IAuditLog } from '../models/index';

export class AuditLogRepository extends BaseRepository<IAuditLog> {
  constructor() {
    super('audit_logs');
  }
}

export const auditLogRepository = new AuditLogRepository();
