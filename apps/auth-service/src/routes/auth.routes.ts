import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  loginRateLimiter,
  passwordResetRateLimiter,
  registerRateLimiter,
} from '../middleware/rate-limit.middleware';

const router = Router();
const authController = new AuthController();

// Public routes with rate limiting
router.post('/register', registerRateLimiter, (req, res) =>
  authController.register(req, res)
);
router.post('/login', loginRateLimiter, (req, res) =>
  authController.login(req, res)
);
router.post('/logout', (req, res) => authController.logout(req, res));
router.post('/refresh', (req, res) => authController.refreshToken(req, res));

// Password reset routes with rate limiting
router.post('/forgot-password', passwordResetRateLimiter, (req, res) =>
  authController.requestPasswordReset(req, res)
);
router.post('/reset-password/:token', (req, res) =>
  authController.resetPassword(req, res)
);

// Protected routes
router.get('/me', authMiddleware, (req, res) => authController.getMe(req, res));

export default router;
