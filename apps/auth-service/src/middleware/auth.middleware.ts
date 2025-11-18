import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import redis from '../lib/redis';

// JWT Secret with guaranteed default - TypeScript needs explicit type
const jwtSecretValue =
  process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_SECRET: string = jwtSecretValue;

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | null = null;

    // Try to get token from Authorization header first (for backward compatibility)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    // Fall back to HttpOnly cookie
    else if ((req as any).cookies?.accessToken) {
      token = (req as any).cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Check if token is blacklisted
    try {
      const isBlacklisted = await redis.get(`blacklist:access:${token}`);
      if (isBlacklisted) {
        return res.status(401).json({ error: 'Token has been revoked' });
      }
    } catch (redisError) {
      console.error('Redis error in auth middleware:', redisError);
      // Continue without blacklist check if Redis is down
    }

    // Verify token with explicit secret handling
    const secret: string =
      process.env.JWT_SECRET || 'your-secret-key-change-in-production';

    if (!secret) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // @ts-ignore - TypeScript strict mode can't narrow process.env types properly
    const decoded = jwt.verify(token, secret) as unknown as {
      userId: string;
      email: string;
      role: string;
      type: string;
    };

    // Check if it's an access token
    if (decoded.type !== 'access') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    // Attach user info to request
    (req as AuthRequest).user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};
