import { Schema, model, type Document, type Types } from 'mongoose';
import { AUDIT_ACTION_VALUES } from '../enums/index.js';

export interface IAuditLog extends Document {
  entityType: string;
  entityId: Types.ObjectId;
  action: (typeof AUDIT_ACTION_VALUES)[number];
  actorId?: Types.ObjectId | null;
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

const auditLogSchema = new Schema<IAuditLog>(
  {
    entityType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64,
      index: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: AUDIT_ACTION_VALUES,
      required: true,
      index: true,
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    actorRole: {
      type: String,
      trim: true,
      maxlength: 32,
      default: null,
    },
    changes: {
      before: { type: Schema.Types.Mixed, default: null },
      after: { type: Schema.Types.Mixed, default: null },
    },
    ipAddress: {
      type: String,
      trim: true,
      maxlength: 45,
      default: null,
    },
    userAgent: {
      type: String,
      trim: true,
      maxlength: 512,
      default: null,
    },
    requestId: {
      type: String,
      trim: true,
      maxlength: 64,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    collection: 'auditLogs',
    timestamps: { createdAt: true, updatedAt: false },
  }
);

auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ actorId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);
