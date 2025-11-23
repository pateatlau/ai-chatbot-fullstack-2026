import mongoose, { Document, Schema } from 'mongoose';

export type AuditAction =
  | 'conversation:create'
  | 'conversation:update'
  | 'conversation:delete'
  | 'message:create'
  | 'message:delete';

export interface IAuditLog extends Document {
  userId: string;
  action: AuditAction;
  resourceType: 'conversation' | 'message';
  resourceId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
  expiresAt?: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: [
        'conversation:create',
        'conversation:update',
        'conversation:delete',
        'message:create',
        'message:delete',
      ],
      required: true,
    },
    resourceType: {
      type: String,
      enum: ['conversation', 'message'],
      required: true,
    },
    resourceId: {
      type: String,
      required: true,
    },
    changes: Schema.Types.Mixed,
    ipAddress: String,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// TTL index: automatically expire documents after 90 days (7,776,000 seconds)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

// Additional indexes for audit queries
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

export default AuditLog;
