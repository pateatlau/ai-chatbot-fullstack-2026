import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

// Helper to get JWT secret - called at runtime, not at import time
function getJwtSecret(): string {
  return process.env.JWT_SECRET || 'your-secret-key-change-in-production';
}

/**
 * Middleware to verify JWT token
 * Checks both Authorization header and HttpOnly cookies for token
 */
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | null = null;

    // Try to get token from Authorization header first (for API calls from admin-mfe)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    // Fall back to HttpOnly cookie (for same-domain requests)
    else if ((req as any).cookies?.accessToken) {
      token = (req as any).cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const JWT_SECRET = getJwtSecret();

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (error: any) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Middleware to verify admin role
 */
export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};
