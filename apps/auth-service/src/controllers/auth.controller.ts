import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import {
  LoginSchema,
  CreateUserSchema,
  RefreshTokenSchema,
} from '@myapp/shared/types';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      // Validate input
      const validatedData = CreateUserSchema.parse(req.body);

      // Register user
      const result = await authService.register(validatedData);

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

      res.status(200).json(result);
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
      // Validate input
      const validatedData = RefreshTokenSchema.parse(req.body);

      // Logout user
      const result = await authService.logout(validatedData.refreshToken);

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
      // Validate input
      const validatedData = RefreshTokenSchema.parse(req.body);

      // Refresh token
      const result = await authService.refreshToken(validatedData.refreshToken);

      res.status(200).json(result);
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
}
