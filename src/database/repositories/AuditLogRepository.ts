import { BaseRepository } from './BaseRepository.js';
import { AuditLog, type IAuditLog } from '../models/index.js';

export class AuditLogRepository extends BaseRepository<IAuditLog> {
  constructor() {
    super(AuditLog);
  }
}

export const auditLogRepository = new AuditLogRepository();
