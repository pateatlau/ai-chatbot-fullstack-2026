import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AdminService } from '../services/admin.service';
import { AuditService } from '../services/audit.service';
import {
  UpdateUserByAdminSchema,
  UserListQuerySchema,
} from '@myapp/shared/types';

const adminService = new AdminService();

export class AdminController {
  /**
   * GET /admin/users
   * List users with pagination, filtering, and sorting
   */
  async listUsers(req: AuthRequest, res: Response) {
    try {
      const adminId = req.user!.userId;

      // Parse and validate query parameters
      const query = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 20,
        sortBy: req.query.sortBy as any,
        sortOrder: (req.query.sortOrder as any) || 'desc',
        search: req.query.search as string,
        role: req.query.role as any,
        isActive:
          req.query.isActive === 'true'
            ? true
            : req.query.isActive === 'false'
              ? false
              : undefined,
      };

      const result = await adminService.listUsers(query);

      // Log audit
      await AuditService.log(adminId, 'ADMIN_LOGIN', undefined, {
        action: 'list_users',
        filters: query,
      });

      res.json(result);
    } catch (error) {
      console.error('List users error:', error);
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to list users' });
    }
  }

  /**
   * GET /admin/users/:id
   * Get single user details
   */
  async getUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const adminId = req.user!.userId;

      const user = await adminService.getUserById(id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Log audit
      await AuditService.log(adminId, 'ADMIN_LOGIN', id, {
        action: 'view_user',
      });

      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to get user' });
    }
  }

  /**
   * PATCH /admin/users/:id
   * Update user (role, status, etc.)
   */
  async updateUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const adminId = req.user!.userId;

      // Validate input
      const validatedData = UpdateUserByAdminSchema.parse(req.body);

      // Prevent admin from deactivating themselves
      if (id === adminId && validatedData.isActive === false) {
        return res
          .status(400)
          .json({ error: 'Cannot deactivate your own account' });
      }

      // Prevent admin from demoting themselves
      if (
        id === adminId &&
        validatedData.role &&
        validatedData.role !== 'ADMIN'
      ) {
        return res.status(400).json({ error: 'Cannot change your own role' });
      }

      const user = await adminService.updateUser(id, validatedData);

      // Log audit
      await AuditService.log(adminId, 'USER_UPDATED', id, {
        changes: validatedData,
      });

      res.json({
        message: 'User updated successfully',
        user,
      });
    } catch (error) {
      console.error('Update user error:', error);
      if (error instanceof Error) {
        if (error.message === 'User not found') {
          return res.status(404).json({ error: error.message });
        }
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to update user' });
    }
  }

  /**
   * DELETE /admin/users/:id
   * Soft delete user
   */
  async deleteUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const adminId = req.user!.userId;

      // Prevent admin from deleting themselves
      if (id === adminId) {
        return res
          .status(400)
          .json({ error: 'Cannot delete your own account' });
      }

      await adminService.deleteUser(id);

      // Log audit
      await AuditService.log(adminId, 'USER_DELETED', id, {
        action: 'soft_delete',
      });

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      if (error instanceof Error) {
        if (error.message === 'User not found') {
          return res.status(404).json({ error: error.message });
        }
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }

  /**
   * POST /admin/users/:id/reset-password
   * Admin reset user password
   */
  async resetUserPassword(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const adminId = req.user!.userId;

      const result = await adminService.resetUserPassword(id);

      // Log audit
      await AuditService.log(adminId, 'PASSWORD_RESET_BY_ADMIN', id);

      res.json(result);
    } catch (error) {
      console.error('Reset password error:', error);
      if (error instanceof Error) {
        if (error.message === 'User not found') {
          return res.status(404).json({ error: error.message });
        }
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to reset password' });
    }
  }

  /**
   * GET /admin/stats
   * Get overview statistics
   */
  async getStats(req: AuthRequest, res: Response) {
    try {
      const stats = await adminService.getOverviewStats();
      res.json(stats);
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ error: 'Failed to get statistics' });
    }
  }

  /**
   * GET /admin/audit-logs
   * Get audit logs with pagination
   */
  async getAuditLogs(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const filters: any = {};
      if (req.query.adminId) filters.adminId = req.query.adminId;
      if (req.query.action) filters.action = req.query.action;
      if (req.query.targetUserId) filters.targetUserId = req.query.targetUserId;

      const result = await AuditService.getLogs(page, limit, filters);

      res.json({
        logs: result.logs,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      });
    } catch (error) {
      console.error('Get audit logs error:', error);
      res.status(500).json({ error: 'Failed to get audit logs' });
    }
  }
}
