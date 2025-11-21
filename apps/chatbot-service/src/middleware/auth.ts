import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Load JWT secret at runtime to ensure .env is loaded first
function getJwtSecret(): string {
  return process.env.JWT_SECRET || 'your-secret-key-change-in-production';
}

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const JWT_SECRET = getJwtSecret();

  // Try to get token from Authorization header first (for API clients)
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];

  // If no Authorization header, try to get token from cookies (for browser requests)
  if (!token && req.cookies) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
