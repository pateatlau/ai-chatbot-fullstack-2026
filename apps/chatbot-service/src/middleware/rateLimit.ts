import Redis from 'ioredis';
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const defaultConfig: RateLimitConfig = {
  maxRequests: 10, // 10 messages per minute
  windowMs: 60 * 1000, // 1 minute
};

export const rateLimitMiddleware = (
  config: RateLimitConfig = defaultConfig
) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `rate-limit:chatbot:${userId}`;

    try {
      const current = await redis.incr(key);

      if (current === 1) {
        await redis.pexpire(key, config.windowMs);
      }

      if (current > config.maxRequests) {
        const ttl = await redis.pttl(key);
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: Math.ceil(ttl / 1000),
        });
      }

      res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
      res.setHeader(
        'X-RateLimit-Remaining',
        Math.max(0, config.maxRequests - current).toString()
      );

      next();
    } catch (error) {
      console.error('Rate limit error:', error);
      // Fail open - allow request if Redis is down
      next();
    }
  };
};
