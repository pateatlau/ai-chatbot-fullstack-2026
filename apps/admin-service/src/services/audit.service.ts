import { query } from '../lib/db';
import { v4 as uuidv4 } from 'uuid';

export type AuditAction =
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'USER_ROLE_CHANGED'
  | 'USER_STATUS_CHANGED'
  | 'PASSWORD_RESET_BY_ADMIN'
  | 'ADMIN_LOGIN'
  | 'ADMIN_LOGOUT';

export interface AuditLogEntry {
  id: string;
  adminId: string;
  action: AuditAction;
  targetUserId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export class AuditService {
  /**
   * Create an audit log entry
   */
  static async log(
    adminId: string,
    action: AuditAction,
    targetUserId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const id = uuidv4();

      await query(
        `INSERT INTO audit_logs (id, "adminId", action, "targetUserId", metadata, "createdAt")
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          id,
          adminId,
          action,
          targetUserId || null,
          metadata ? JSON.stringify(metadata) : null,
        ]
      );
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw - audit logging failure shouldn't break the main operation
    }
  }

  /**
   * Get audit logs with pagination
   */
  static async getLogs(
    page: number = 1,
    limit: number = 50,
    filters?: {
      adminId?: string;
      action?: AuditAction;
      targetUserId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{ logs: AuditLogEntry[]; total: number }> {
    const offset = (page - 1) * limit;

    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (filters?.adminId) {
      whereConditions.push(`"adminId" = $${paramIndex}`);
      params.push(filters.adminId);
      paramIndex++;
    }

    if (filters?.action) {
      whereConditions.push(`action = $${paramIndex}`);
      params.push(filters.action);
      paramIndex++;
    }

    if (filters?.targetUserId) {
      whereConditions.push(`"targetUserId" = $${paramIndex}`);
      params.push(filters.targetUserId);
      paramIndex++;
    }

    if (filters?.startDate) {
      whereConditions.push(`"createdAt" >= $${paramIndex}`);
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters?.endDate) {
      whereConditions.push(`"createdAt" <= $${paramIndex}`);
      params.push(filters.endDate);
      paramIndex++;
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as count FROM audit_logs ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated logs
    params.push(limit, offset);
    const logsResult = await query(
      `SELECT * FROM audit_logs 
       ${whereClause}
       ORDER BY "createdAt" DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    // PostgreSQL JSONB is already parsed by pg library, no need to JSON.parse
    const logs = logsResult.rows;

    return { logs, total };
  }
}
