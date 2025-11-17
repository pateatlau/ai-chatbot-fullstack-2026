import { query } from '../lib/db';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

interface UserListFilters {
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'name' | 'email';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  role?: 'USER' | 'ADMIN';
  isActive?: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
}

export class AdminService {
  /**
   * List users with pagination and filtering
   */
  async listUsers(filters: UserListFilters) {
    const {
      page = 1,
      pageSize = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      role,
      isActive,
    } = filters;

    const offset = (page - 1) * pageSize;
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Build WHERE conditions
    if (search) {
      conditions.push(
        `(name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`
      );
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (role) {
      conditions.push(`role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    if (isActive !== undefined) {
      conditions.push(`"isActive" = $${paramIndex}`);
      params.push(isActive);
      paramIndex++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated users
    const sortColumn = sortBy === 'createdAt' ? '"createdAt"' : sortBy;
    const usersResult = await query(
      `SELECT id, email, name, role, avatar, "isActive", "createdAt", "updatedAt", "lastLoginAt"
       FROM users
       ${whereClause}
       ORDER BY ${sortColumn} ${sortOrder.toUpperCase()}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, pageSize, offset]
    );

    return {
      users: usersResult.rows,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    const result = await query(
      `SELECT id, email, name, role, avatar, "isActive", "createdAt", "updatedAt", "lastLoginAt"
       FROM users
       WHERE id = $1`,
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const allowedFields = ['name', 'role', 'isActive', 'avatar'];
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Build dynamic UPDATE statement
    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key) && value !== undefined) {
        const columnName = key === 'isActive' ? '"isActive"' : key;
        updates.push(`${columnName} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    // Add updatedAt
    updates.push(`"updatedAt" = NOW()`);

    params.push(id);

    const result = await query(
      `UPDATE users
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, email, name, role, avatar, "isActive", "createdAt", "updatedAt", "lastLoginAt"`,
      params
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return result.rows[0];
  }

  /**
   * Soft delete user (set isActive = false)
   */
  async deleteUser(id: string): Promise<void> {
    const result = await query(
      `UPDATE users
       SET "isActive" = false, "updatedAt" = NOW()
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    // Also invalidate all sessions for this user
    await query(`DELETE FROM sessions WHERE "userId" = $1`, [id]);
  }

  /**
   * Admin reset user password
   */
  async resetUserPassword(id: string): Promise<{ temporaryPassword: string }> {
    // Generate random temporary password
    const temporaryPassword = randomBytes(12).toString('base64').slice(0, 16);

    // Hash the password
    const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

    // Update user password
    const result = await query(
      `UPDATE users
       SET password = $1, "updatedAt" = NOW()
       WHERE id = $2
       RETURNING id`,
      [hashedPassword, id]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    // Invalidate all sessions
    await query(`DELETE FROM sessions WHERE "userId" = $1`, [id]);

    return { temporaryPassword };
  }

  /**
   * Get overview statistics
   */
  async getOverviewStats() {
    // Total users
    const totalUsersResult = await query(`SELECT COUNT(*) FROM users`);
    const totalUsers = parseInt(totalUsersResult.rows[0].count);

    // Active users
    const activeUsersResult = await query(
      `SELECT COUNT(*) FROM users WHERE "isActive" = true`
    );
    const activeUsers = parseInt(activeUsersResult.rows[0].count);

    // Users created in last 30 days
    const recentUsersResult = await query(
      `SELECT COUNT(*) FROM users WHERE "createdAt" >= NOW() - INTERVAL '30 days'`
    );
    const recentUsers = parseInt(recentUsersResult.rows[0].count);

    // User growth rate (compare last 30 days to previous 30 days)
    const previousPeriodResult = await query(
      `SELECT COUNT(*) FROM users 
       WHERE "createdAt" >= NOW() - INTERVAL '60 days' 
       AND "createdAt" < NOW() - INTERVAL '30 days'`
    );
    const previousPeriodUsers = parseInt(previousPeriodResult.rows[0].count);
    const userGrowthRate =
      previousPeriodUsers > 0
        ? ((recentUsers - previousPeriodUsers) / previousPeriodUsers) * 100
        : 0;

    // Total conversations
    const totalConversationsResult = await query(
      `SELECT COUNT(*) FROM conversations`
    );
    const totalConversations = parseInt(totalConversationsResult.rows[0].count);

    // Active conversations (last 7 days)
    const activeConversationsResult = await query(
      `SELECT COUNT(*) FROM conversations WHERE "updatedAt" >= NOW() - INTERVAL '7 days'`
    );
    const activeConversations = parseInt(
      activeConversationsResult.rows[0].count
    );

    // Average messages per conversation
    const avgMessagesResult = await query(
      `SELECT AVG(message_count) as avg FROM (
        SELECT COUNT(*) as message_count 
        FROM messages 
        GROUP BY "conversationId"
      ) as counts`
    );
    const averageMessagesPerConversation = parseFloat(
      avgMessagesResult.rows[0]?.avg || 0
    );

    return {
      totalUsers,
      activeUsers,
      userGrowthRate: Math.round(userGrowthRate * 100) / 100,
      totalConversations,
      activeConversations,
      averageMessagesPerConversation:
        Math.round(averageMessagesPerConversation * 100) / 100,
    };
  }
}
