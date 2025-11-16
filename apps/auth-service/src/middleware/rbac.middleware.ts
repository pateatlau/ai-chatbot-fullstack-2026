import type { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.middleware';

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};

// Specific role guards
export const requireAdmin = requireRole(['ADMIN']);
export const requireModerator = requireRole(['ADMIN', 'MODERATOR']);
