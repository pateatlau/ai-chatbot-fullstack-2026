import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import {
  LoginSchema,
  CreateUserSchema,
  RefreshTokenSchema,
  UpdateUserSchema,
  ChangePasswordSchema,
} from '@myapp/shared/types';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      // Validate input
      const validatedData = CreateUserSchema.parse(req.body);

      // WORKAROUND: Manually add role from request body since Zod is stripping it
      const finalData = {
        ...validatedData,
        role: req.body.role || 'USER',
      };

      // Register user
      const result = await authService.register(finalData);

      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'User with this email already exists') {
          return res.status(409).json({ error: error.message });
        }
        // Zod validation error
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      // Validate input
      const validatedData = LoginSchema.parse(req.body);

      // Login user
      const result = await authService.login(validatedData);

      // Set HttpOnly cookies for tokens (secure authentication)
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: '/',
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });

      // Return user data without tokens
      res.status(200).json({
        user: result.user,
        expiresIn: result.expiresIn,
        message: 'Login successful',
      });
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message === 'Invalid email or password' ||
          error.message === 'Account is deactivated'
        ) {
          return res.status(401).json({ error: error.message });
        }
        // Zod validation error
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      // Get refresh token from cookie
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
      }

      // Get access token from cookie if available
      const accessToken = req.cookies.accessToken;
      if (accessToken) {
        await authService.blacklistAccessToken(accessToken);
      }

      // Logout user
      const result = await authService.logout(refreshToken);

      // Clear cookies
      res.clearCookie('accessToken', { path: '/' });
      res.clearCookie('refreshToken', { path: '/' });

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      // Get refresh token from cookie
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
      }

      // Refresh token
      const result = await authService.refreshToken(refreshToken);

      // Set new HttpOnly cookies
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: '/',
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });

      // Return only expiration info
      res.status(200).json({
        expiresIn: result.expiresIn,
        message: 'Token refreshed successfully',
      });
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message === 'Invalid refresh token' ||
          error.message === 'Session not found' ||
          error.message === 'Session expired'
        ) {
          return res.status(401).json({ error: error.message });
        }
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getMe(req: Request, res: Response) {
    try {
      // User ID is set by auth middleware
      const userId = (req as any).user.userId;

      // Get user
      const user = await authService.getMe(userId);

      res.status(200).json(user);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'User not found') {
          return res.status(404).json({ error: error.message });
        }
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      const result = await authService.requestPasswordReset(email);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const { password } = req.body;

      if (!token) {
        return res.status(400).json({ error: 'Reset token is required' });
      }

      if (!password || typeof password !== 'string') {
        return res.status(400).json({ error: 'New password is required' });
      }

      // Validate password strength
      if (password.length < 8) {
        return res
          .status(400)
          .json({ error: 'Password must be at least 8 characters long' });
      }

      if (!/[A-Z]/.test(password)) {
        return res.status(400).json({
          error: 'Password must contain at least one uppercase letter',
        });
      }

      if (!/[a-z]/.test(password)) {
        return res.status(400).json({
          error: 'Password must contain at least one lowercase letter',
        });
      }

      if (!/[0-9]/.test(password)) {
        return res
          .status(400)
          .json({ error: 'Password must contain at least one number' });
      }

      if (!/[^A-Za-z0-9]/.test(password)) {
        return res.status(400).json({
          error: 'Password must contain at least one special character',
        });
      }

      const result = await authService.resetPassword(token, password);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Invalid or expired reset token') {
          return res.status(400).json({ error: error.message });
        }
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      // Get user ID from auth middleware
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate input
      const validatedData = UpdateUserSchema.parse(req.body);

      // Update profile
      const result = await authService.updateProfile(userId, validatedData);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'User not found') {
          return res.status(404).json({ error: error.message });
        }
        if (error.message === 'No fields to update') {
          return res.status(400).json({ error: error.message });
        }
        // Zod validation error
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      // Get user ID from auth middleware
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate input
      const validatedData = ChangePasswordSchema.parse(req.body);

      // Change password
      const result = await authService.changePassword(
        userId,
        validatedData.currentPassword,
        validatedData.newPassword
      );

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Current password is incorrect') {
          return res.status(400).json({ error: error.message });
        }
        if (error.message === 'User not found') {
          return res.status(404).json({ error: error.message });
        }
        // Zod validation error
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
