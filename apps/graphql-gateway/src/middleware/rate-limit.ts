import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

/**
 * In-memory rate limiting store
 * In production, this would use Redis for distributed rate limiting
 */
const rateLimitStore: RateLimitStore = {};

/**
 * Clean up old entries from rate limit store (runs every 5 minutes)
 */
setInterval(
  () => {
    const now = Date.now();
    for (const key in rateLimitStore) {
      if (rateLimitStore[key] && rateLimitStore[key].resetTime < now) {
        delete rateLimitStore[key];
      }
    }
  },
  5 * 60 * 1000
);

/**
 * Get or create rate limit key for user/IP
 */
function getRateLimitKey(req: Request): string {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (token) {
    try {
      const decoded: any = jwt.verify(
        token,
        process.env.JWT_SECRET || 'default-secret'
      );
      return `user:${decoded.userId}`;
    } catch (err) {
      // If token is invalid, fall back to IP
      return `ip:${req.ip}`;
    }
  }

  return `ip:${req.ip}`;
}

/**
 * Rate limiting middleware
 * Limits to 100 requests per 60 seconds per user/IP
 */
export function createRateLimitMiddleware() {
  const MAX_REQUESTS = 100;
  const WINDOW_MS = 60 * 1000; // 60 seconds

  return (req: Request, res: Response, next: NextFunction) => {
    // Skip rate limiting for health checks
    if (req.path === '/health' || req.path === '/ready') {
      return next();
    }

    const key = getRateLimitKey(req);
    const now = Date.now();

    // Initialize or update rate limit entry
    if (!rateLimitStore[key]) {
      rateLimitStore[key] = {
        count: 1,
        resetTime: now + WINDOW_MS,
      };
      console.log(`[RateLimit] New entry: ${key}`);
      return next();
    }

    const entry = rateLimitStore[key];

    // Check if window has expired
    if (now > entry.resetTime) {
      entry.count = 1;
      entry.resetTime = now + WINDOW_MS;
      console.log(`[RateLimit] Window reset: ${key}`);
      return next();
    }

    // Check if limit exceeded
    if (entry.count >= MAX_REQUESTS) {
      const remainingTime = Math.ceil((entry.resetTime - now) / 1000);
      console.warn(
        `[RateLimit] Limit exceeded: ${key} (${entry.count}/${MAX_REQUESTS})`
      );

      res.set({
        'Retry-After': remainingTime.toString(),
        'X-RateLimit-Limit': MAX_REQUESTS.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': entry.resetTime.toString(),
      });

      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Maximum ${MAX_REQUESTS} requests per minute.`,
        retryAfter: remainingTime,
      });
    }

    // Increment counter and continue
    entry.count++;
    const remaining = MAX_REQUESTS - entry.count;

    res.set({
      'X-RateLimit-Limit': MAX_REQUESTS.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': entry.resetTime.toString(),
    });

    console.log(
      `[RateLimit] Request allowed: ${key} (${entry.count}/${MAX_REQUESTS})`
    );
    next();
  };
}
