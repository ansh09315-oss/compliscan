/**
 * Rate Limiting Utility (Sliding Window / Token Bucket)
 * Prevents brute-force credential stuffing and API denial of service.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory sliding window bucket cache
const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up expired buckets periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (record.resetAt <= now) {
        rateLimitMap.delete(key);
      }
    }
  }, 60000); // Purge every 60 seconds
}

export interface RateLimitOptions {
  limit: number;        // Maximum number of requests allowed in window
  windowMs: number;     // Window duration in milliseconds
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 60, windowMs: 60000 }
): RateLimitResult {
  const now = Date.now();
  const existing = rateLimitMap.get(identifier);

  if (!existing || existing.resetAt <= now) {
    // New or expired window
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return {
      success: true,
      limit: options.limit,
      remaining: options.limit - 1,
      resetSeconds: Math.ceil(options.windowMs / 1000),
    };
  }

  // Active window
  if (existing.count >= options.limit) {
    const resetSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      resetSeconds,
    };
  }

  existing.count += 1;
  const resetSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
  return {
    success: true,
    limit: options.limit,
    remaining: Math.max(0, options.limit - existing.count),
    resetSeconds,
  };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}
