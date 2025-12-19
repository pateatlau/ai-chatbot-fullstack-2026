import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Create Redis client with proper error handling
const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError(err) {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      // Only reconnect when the error contains "READONLY"
      return true;
    }
    return false;
  },
  lazyConnect: false,
  enableReadyCheck: true,
  showFriendlyErrorStack: process.env.NODE_ENV !== 'production',
});

// Handle connection events
redis.on('connect', () => {
  console.log('✓ Redis connected successfully');
});

redis.on('ready', () => {
  console.log('✓ Redis ready to accept commands');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err.message);
  // Don't throw - fail gracefully
});

redis.on('close', () => {
  console.warn('⚠ Redis connection closed');
});

redis.on('reconnecting', () => {
  console.log('↻ Reconnecting to Redis...');
});

// Test connection on startup
redis
  .ping()
  .then(() => {
    console.log('✓ Redis ping successful');
  })
  .catch((err) => {
    console.error('✗ Redis ping failed:', err.message);
    console.warn('⚠ Application will continue with Redis features disabled');
  });

export default redis;
