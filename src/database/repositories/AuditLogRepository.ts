import { BaseRepository } from './BaseRepository.ts';
import { AuditLog, type IAuditLog } from '../models/index.ts';

export class AuditLogRepository extends BaseRepository<IAuditLog> {
  constructor() {
    super(AuditLog);
  }
}

export const auditLogRepository = new AuditLogRepository();
