import { AUDIT_ACTION_VALUES } from '../enums/index.ts';

export interface IAuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: (typeof AUDIT_ACTION_VALUES)[number];
  actorId?: string | null;
  actorRole?: string;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}
