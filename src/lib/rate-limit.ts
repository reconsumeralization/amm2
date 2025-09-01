// src/lib/rate-limit.ts
import { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

// Create rate limiter instance
const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
});

interface RateLimitOptions {
  limit?: number;
  window?: string;
  identifier: string;
}

/**
 * Rate limiting utility for API routes
 * @param request - NextRequest object
 * @param options - Rate limiting options
 * @returns Promise with rate limit result
 */
export async function rateLimit(
  request: NextRequest,
  options: RateLimitOptions
) {
  try {
    const { limit = 100, window = '1m', identifier } = options;

    // Create custom limiter for this request
    const limiter = new Ratelimit({
      redis: kv,
      limiter: Ratelimit.slidingWindow(limit, window),
    });

    // Get client IP or use identifier
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'anonymous';

    const key = `${identifier}:${ip}`;

    const result = await limiter.limit(key);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      error: result.success ? null : 'Rate limit exceeded',
    };
  } catch (error) {
    // If rate limiting fails, allow the request (fail open)
    console.error('Rate limiting error:', error);
    return {
      success: true,
      limit: 1000,
      remaining: 999,
      reset: Date.now() + 60000,
      error: null,
    };
  }
}

/**
 * Get rate limit status for a request
 * @param request - NextRequest object
 * @param identifier - Unique identifier for the rate limit
 * @returns Promise with current rate limit status
 */
export async function getRateLimitStatus(
  request: NextRequest,
  identifier: string
) {
  try {
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'anonymous';

    const key = `${identifier}:${ip}`;

    const result = await ratelimit.limit(key);

    return {
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      resetInSeconds: Math.floor((result.reset - Date.now()) / 1000),
    };
  } catch (error) {
    console.error('Rate limit status error:', error);
    return null;
  }
}
