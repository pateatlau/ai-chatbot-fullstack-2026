import { useState, useEffect } from 'react';

interface RateLimitInfo {
  remaining: number;
  limit: number;
  resetTime: Date | null;
  isNearLimit: boolean; // true when remaining <= 3
  isLimited: boolean; // true when remaining = 0
}

/**
 * Hook to track rate limit status
 * Monitors message count and warns user when approaching limit
 */
export function useRateLimit(limit: number = 10, windowMinutes: number = 1) {
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo>({
    remaining: limit,
    limit,
    resetTime: null,
    isNearLimit: false,
    isLimited: false,
  });

  const [messageTimestamps, setMessageTimestamps] = useState<number[]>([]);

  // Track a new message
  const trackMessage = () => {
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;

    // Add new timestamp and filter out old ones outside the window
    const updatedTimestamps = [...messageTimestamps, now].filter(
      (timestamp) => now - timestamp < windowMs
    );

    setMessageTimestamps(updatedTimestamps);

    // Calculate remaining
    const remaining = Math.max(0, limit - updatedTimestamps.length);
    const oldestTimestamp = updatedTimestamps[0];
    const resetTime = oldestTimestamp
      ? new Date(oldestTimestamp + windowMs)
      : null;

    setRateLimitInfo({
      remaining,
      limit,
      resetTime,
      isNearLimit: remaining <= 3 && remaining > 0,
      isLimited: remaining === 0,
    });
  };

  // Update rate limit info from response headers
  const updateFromHeaders = (headers: {
    'x-ratelimit-limit'?: string;
    'x-ratelimit-remaining'?: string;
    'x-ratelimit-reset'?: string;
  }) => {
    const limitHeader = headers['x-ratelimit-limit'];
    const remainingHeader = headers['x-ratelimit-remaining'];
    const resetHeader = headers['x-ratelimit-reset'];

    if (limitHeader && remainingHeader) {
      const remaining = parseInt(remainingHeader, 10);
      const limit = parseInt(limitHeader, 10);
      const resetTime = resetHeader
        ? new Date(parseInt(resetHeader, 10) * 1000)
        : null;

      setRateLimitInfo({
        remaining,
        limit,
        resetTime,
        isNearLimit: remaining <= 3 && remaining > 0,
        isLimited: remaining === 0,
      });
    }
  };

  // Periodically clean up old timestamps
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const windowMs = windowMinutes * 60 * 1000;

      const updatedTimestamps = messageTimestamps.filter(
        (timestamp) => now - timestamp < windowMs
      );

      if (updatedTimestamps.length !== messageTimestamps.length) {
        setMessageTimestamps(updatedTimestamps);

        const remaining = Math.max(0, limit - updatedTimestamps.length);
        const oldestTimestamp = updatedTimestamps[0];
        const resetTime = oldestTimestamp
          ? new Date(oldestTimestamp + windowMs)
          : null;

        setRateLimitInfo({
          remaining,
          limit,
          resetTime,
          isNearLimit: remaining <= 3 && remaining > 0,
          isLimited: remaining === 0,
        });
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [messageTimestamps, limit, windowMinutes]);

  return {
    rateLimitInfo,
    trackMessage,
    updateFromHeaders,
  };
}
