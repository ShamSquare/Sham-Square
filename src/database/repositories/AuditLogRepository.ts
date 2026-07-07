import { BaseRepository } from './BaseRepository.ts';
import type { IAuditLog } from '../models/index.ts';

export class AuditLogRepository extends BaseRepository<IAuditLog> {
  constructor() {
    super('audit_logs');
  }
}

export const auditLogRepository = new AuditLogRepository();
