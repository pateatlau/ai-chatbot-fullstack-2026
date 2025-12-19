import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';
import { AdminController } from '../controllers/admin.controller';

const router = Router();
const adminController = new AdminController();

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: List all users
 *     description: Get paginated list of all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [USER, ADMIN]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *       403:
 *         description: Forbidden - Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// User management
router.get('/users', (req, res) => adminController.listUsers(req, res));

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Get detailed information about a specific user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/users/:id', (req, res) => adminController.getUser(req, res));

/**
 * @swagger
 * /api/admin/users/{id}:
 *   patch:
 *     summary: Update user
 *     description: Update user information (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/users/:id', (req, res) => adminController.updateUser(req, res));

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete user
 *     description: Soft delete a user account (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/users/:id', (req, res) => adminController.deleteUser(req, res));

/**
 * @swagger
 * /api/admin/users/{id}/reset-password:
 *   post:
 *     summary: Reset user password
 *     description: Admin can reset any user's password (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Password reset email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/users/:id/reset-password', (req, res) =>
  adminController.resetUserPassword(req, res)
);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get system statistics
 *     description: Get comprehensive system statistics including users, chats, and system metrics (Admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   $ref: '#/components/schemas/UserStats'
 *                 chats:
 *                   $ref: '#/components/schemas/ChatStats'
 *                 system:
 *                   $ref: '#/components/schemas/SystemStats'
 */
// Statistics
router.get('/stats', (req, res) => adminController.getStats(req, res));

/**
 * @swagger
 * /api/admin/audit-logs:
 *   get:
 *     summary: Get audit logs
 *     description: Get paginated audit logs for system monitoring (Admin only)
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audit logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AuditLog'
 *                 pagination:
 *                   type: object
 */
// Audit logs
router.get('/audit-logs', (req, res) => adminController.getAuditLogs(req, res));

export default router;
