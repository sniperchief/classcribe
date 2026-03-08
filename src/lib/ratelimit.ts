import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Different rate limiters for different endpoint types
export const rateLimiters = {
  // Standard API rate limit: 7 requests per minute per user
  standard: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(7, '1 m'),
    analytics: true,
    prefix: 'ratelimit:standard',
  }),

  // Generation endpoints (expensive): 7 requests per minute per user
  generation: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(7, '1 m'),
    analytics: true,
    prefix: 'ratelimit:generation',
  }),

  // Guest endpoints: 3 requests per hour per IP (stricter)
  guest: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    analytics: true,
    prefix: 'ratelimit:guest',
  }),

  // Auth endpoints: 5 requests per minute per IP (prevent brute force)
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
    prefix: 'ratelimit:auth',
  }),

  // Read-only endpoints: 60 requests per minute (more generous)
  read: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    analytics: true,
    prefix: 'ratelimit:read',
  }),

  // Public share endpoints: 30 requests per minute per IP
  public: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    analytics: true,
    prefix: 'ratelimit:public',
  }),
};

export type RateLimitType = keyof typeof rateLimiters;

/**
 * Get client identifier (user ID for authenticated, IP for guests)
 */
export async function getClientIdentifier(userId?: string): Promise<string> {
  if (userId) {
    return `user:${userId}`;
  }

  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';

  return `ip:${ip}`;
}

/**
 * Check rate limit and return response if limited
 */
export async function checkRateLimit(
  identifier: string,
  type: RateLimitType = 'standard'
): Promise<{ success: boolean; response?: NextResponse }> {
  // Skip rate limiting if Redis is not configured (development)
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('[RateLimit] Skipping - Redis not configured');
    return { success: true };
  }

  try {
    const limiter = rateLimiters[type];
    const { success, limit, reset, remaining } = await limiter.limit(identifier);

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);

      return {
        success: false,
        response: NextResponse.json(
          {
            error: 'Too many requests. Please try again later.',
            retryAfter,
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': reset.toString(),
              'Retry-After': retryAfter.toString(),
            },
          }
        ),
      };
    }

    return { success: true };
  } catch (error) {
    // If rate limiting fails, allow the request but log the error
    console.error('[RateLimit] Error:', error);
    return { success: true };
  }
}

/**
 * Rate limit wrapper for API routes
 * Usage:
 *   const rateLimitResult = await rateLimit(userId, 'generation');
 *   if (!rateLimitResult.success) return rateLimitResult.response;
 */
export async function rateLimit(
  userId?: string,
  type: RateLimitType = 'standard'
): Promise<{ success: boolean; response?: NextResponse }> {
  const identifier = await getClientIdentifier(userId);
  return checkRateLimit(identifier, type);
}
