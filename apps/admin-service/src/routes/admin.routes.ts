import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';
import { AdminController } from '../controllers/admin.controller';

const router = Router();
const adminController = new AdminController();

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// User management
router.get('/users', (req, res) => adminController.listUsers(req, res));
router.get('/users/:id', (req, res) => adminController.getUser(req, res));
router.patch('/users/:id', (req, res) => adminController.updateUser(req, res));
router.delete('/users/:id', (req, res) => adminController.deleteUser(req, res));
router.post('/users/:id/reset-password', (req, res) =>
  adminController.resetUserPassword(req, res)
);

// Statistics
router.get('/stats', (req, res) => adminController.getStats(req, res));

// Audit logs
router.get('/audit-logs', (req, res) => adminController.getAuditLogs(req, res));

export default router;
