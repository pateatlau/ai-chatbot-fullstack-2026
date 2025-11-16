import type { Request, Response, NextFunction } from 'express';
import redis from '../lib/redis';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  keyPrefix: string;
}

export const createRateLimiter = (config: RateLimitConfig) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Use IP address or user identifier
    const identifier = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const key = `${config.keyPrefix}:${identifier}`;

    try {
      const current = await redis.incr(key);

      if (current === 1) {
        // Set expiry on first request
        await redis.pexpire(key, config.windowMs);
      }

      if (current > config.maxAttempts) {
        const ttl = await redis.pttl(key);
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: Math.ceil(ttl / 1000),
          message: `Maximum ${config.maxAttempts} attempts allowed per ${Math.ceil(config.windowMs / 60000)} minutes`,
        });
      }

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', config.maxAttempts.toString());
      res.setHeader(
        'X-RateLimit-Remaining',
        Math.max(0, config.maxAttempts - current).toString()
      );
      res.setHeader('X-RateLimit-Reset', Date.now() + (await redis.pttl(key)));

      next();
    } catch (error) {
      console.error('Rate limit error:', error);
      // Fail open - allow request if Redis is down
      next();
    }
  };
};

// Specific rate limiters
export const loginRateLimiter = createRateLimiter({
  maxAttempts: 1000,
  windowMs: 15 * 60 * 1000, // 15 minutes
  keyPrefix: 'rate-limit:login',
});

export const passwordResetRateLimiter = createRateLimiter({
  maxAttempts: 1000,
  windowMs: 60 * 60 * 1000, // 1 hour
  keyPrefix: 'rate-limit:password-reset',
});

export const registerRateLimiter = createRateLimiter({
  maxAttempts: 1000,
  windowMs: 60 * 60 * 1000, // 1 hour
  keyPrefix: 'rate-limit:register',
});
