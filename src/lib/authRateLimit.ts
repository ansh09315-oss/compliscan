import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export type AuthAction = 'login' | 'signup' | 'password-reset';

export interface AuthRateLimitConfig {
  limit: number;          // Maximum failed attempts before temporary lockout
  windowSeconds: number;  // Sliding window duration in seconds
  lockoutSeconds: number; // Temporary lockout duration in seconds
}

export const AUTH_LIMITS: Record<AuthAction, AuthRateLimitConfig> = {
  // 5 attempts per 15 min per IP+email; 15 min (900s) temporary lockout on 5th consecutive failure
  login: {
    limit: 5,
    windowSeconds: 900,     // 15 minutes
    lockoutSeconds: 900,    // 15 minutes lockout
  },
  // 3 signup attempts per 15 min per IP (prevents mass bot registration)
  signup: {
    limit: 3,
    windowSeconds: 900,     // 15 minutes
    lockoutSeconds: 900,    // 15 minutes lockout
  },
  // 3 password reset attempts per 15 min per IP+email (prevents OTP enumeration & email spam)
  'password-reset': {
    limit: 3,
    windowSeconds: 900,     // 15 minutes
    lockoutSeconds: 900,    // 15 minutes lockout
  },
};

export interface AuthRateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
  isLocked: boolean;
  lockoutExpiresAt?: number;
  consecutiveFailures: number;
  errorMessage?: string;
}

// ---------------------------------------------------------------------------
// 1. Upstash Redis Client Initialization (with automatic memory fallback)
// ---------------------------------------------------------------------------
const isUpstashConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

const upstashRedis = isUpstashConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Upstash Ratelimit instances (created when Upstash credentials are provided)
const upstashLimiters: Record<AuthAction, Ratelimit | null> = {
  login: upstashRedis
    ? new Ratelimit({
        redis: upstashRedis,
        limiter: Ratelimit.slidingWindow(AUTH_LIMITS.login.limit, '15 m'),
        prefix: 'compliscan:ratelimit:login',
      })
    : null,
  signup: upstashRedis
    ? new Ratelimit({
        redis: upstashRedis,
        limiter: Ratelimit.slidingWindow(AUTH_LIMITS.signup.limit, '15 m'),
        prefix: 'compliscan:ratelimit:signup',
      })
    : null,
  'password-reset': upstashRedis
    ? new Ratelimit({
        redis: upstashRedis,
        limiter: Ratelimit.slidingWindow(AUTH_LIMITS['password-reset'].limit, '15 m'),
        prefix: 'compliscan:ratelimit:reset',
      })
    : null,
};

// ---------------------------------------------------------------------------
// 2. High-Performance In-Memory Sliding Window & Lockout Store (Local & Fallback)
// ---------------------------------------------------------------------------
interface MemoryAttemptRecord {
  timestamps: number[];
  consecutiveFailures: number;
  lockedUntil: number | null;
}

const memoryStore = new Map<string, MemoryAttemptRecord>();

// Periodic cleanup of expired records every 60 seconds
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryStore.entries()) {
      const isLocked = record.lockedUntil !== null && record.lockedUntil > now;
      const hasRecentAttempts = record.timestamps.some((t) => now - t < 1800000); // 30 mins
      if (!isLocked && !hasRecentAttempts) {
        memoryStore.delete(key);
      }
    }
  }, 60000);
}

function normalizeKey(action: AuthAction, ip: string, identifier?: string): string {
  const cleanIp = (ip || '127.0.0.1').trim().toLowerCase();
  const cleanId = (identifier || 'anonymous').trim().toLowerCase().replace(/[^a-z0-9@._-]/g, '_');
  return `auth:${action}:${cleanIp}:${cleanId}`;
}

// ---------------------------------------------------------------------------
// 3. Core Rate Limiting & Temporary Lockout Engine
// ---------------------------------------------------------------------------

/**
 * Checks if a request is currently allowed, or if it is blocked by rate limiting or active temporary lockout.
 */
export async function checkAuthRateLimit(
  action: AuthAction,
  ip: string,
  identifier?: string
): Promise<AuthRateLimitResult> {
  const config = AUTH_LIMITS[action];
  const key = normalizeKey(action, ip, identifier);
  const now = Date.now();

  // 1. Check if Upstash Redis is available
  if (upstashRedis && upstashLimiters[action]) {
    try {
      // Check active temporary lockout key in Redis
      const lockoutKey = `compliscan:lockout:${key}`;
      const lockedUntilStr = await upstashRedis.get<string>(lockoutKey);
      if (lockedUntilStr) {
        const lockedUntil = parseInt(lockedUntilStr, 10);
        if (lockedUntil > now) {
          const resetSeconds = Math.max(1, Math.ceil((lockedUntil - now) / 1000));
          return {
            success: false,
            limit: config.limit,
            remaining: 0,
            resetSeconds,
            isLocked: true,
            lockoutExpiresAt: lockedUntil,
            consecutiveFailures: config.limit,
            errorMessage: `Account temporarily locked due to ${config.limit} consecutive failed attempts. Security cooldown active for ${Math.ceil(resetSeconds / 60)} minutes.`,
          };
        }
      }

      // Check Upstash sliding window limiter
      const result = await upstashLimiters[action]!.limit(key);
      if (!result.success) {
        const resetSeconds = Math.max(1, Math.ceil((result.reset - now) / 1000));
        return {
          success: false,
          limit: config.limit,
          remaining: 0,
          resetSeconds,
          isLocked: true,
          lockoutExpiresAt: result.reset,
          consecutiveFailures: config.limit,
          errorMessage: `Rate limit exceeded. Too many ${action} attempts. Please wait ${resetSeconds} seconds.`,
        };
      }

      return {
        success: true,
        limit: config.limit,
        remaining: result.remaining,
        resetSeconds: Math.max(1, Math.ceil((result.reset - now) / 1000)),
        isLocked: false,
        consecutiveFailures: Math.max(0, config.limit - result.remaining),
      };
    } catch (redisErr) {
      console.warn('[Upstash Ratelimit] Error querying Redis, engaging in-memory fallback:', redisErr);
      // Fall through to in-memory store
    }
  }

  // 2. In-Memory Engine (Dev / Local / Fallback)
  let record = memoryStore.get(key);
  if (!record) {
    record = { timestamps: [], consecutiveFailures: 0, lockedUntil: null };
    memoryStore.set(key, record);
  }

  // Check active temporary lockout
  if (record.lockedUntil !== null) {
    if (record.lockedUntil > now) {
      const resetSeconds = Math.max(1, Math.ceil((record.lockedUntil - now) / 1000));
      return {
        success: false,
        limit: config.limit,
        remaining: 0,
        resetSeconds,
        isLocked: true,
        lockoutExpiresAt: record.lockedUntil,
        consecutiveFailures: record.consecutiveFailures,
        errorMessage: `Account temporarily locked due to ${config.limit} consecutive failed attempts. Please wait ${Math.ceil(resetSeconds / 60)} minutes before trying again.`,
      };
    } else {
      // Lockout expired: reset record
      record.lockedUntil = null;
      record.consecutiveFailures = 0;
      record.timestamps = [];
    }
  }

  // Filter timestamps within sliding window
  const windowStart = now - config.windowSeconds * 1000;
  record.timestamps = record.timestamps.filter((t) => t > windowStart);

  if (record.timestamps.length >= config.limit) {
    // Sliding window exceeded -> engage temporary lockout
    const lockedUntil = now + config.lockoutSeconds * 1000;
    record.lockedUntil = lockedUntil;
    const resetSeconds = config.lockoutSeconds;

    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetSeconds,
      isLocked: true,
      lockoutExpiresAt: lockedUntil,
      consecutiveFailures: record.consecutiveFailures,
      errorMessage: `Maximum attempt limit reached (${config.limit}/${Math.ceil(config.windowSeconds / 60)} min). Temporary security lockout active.`,
    };
  }

  const remaining = Math.max(0, config.limit - record.timestamps.length);
  const oldestTimestamp = record.timestamps[0] || now;
  const resetSeconds = Math.max(1, Math.ceil((oldestTimestamp + config.windowSeconds * 1000 - now) / 1000));

  return {
    success: true,
    limit: config.limit,
    remaining,
    resetSeconds,
    isLocked: false,
    consecutiveFailures: record.consecutiveFailures,
  };
}

/**
 * Records a failed authentication attempt.
 * Increments consecutive failures and engages a 15-minute temporary lockout if limit reached.
 */
export async function recordAuthFailure(
  action: AuthAction,
  ip: string,
  identifier?: string
): Promise<AuthRateLimitResult> {
  const config = AUTH_LIMITS[action];
  const key = normalizeKey(action, ip, identifier);
  const now = Date.now();

  let consecutiveFailures = 1;
  let isLocked = false;
  let lockedUntil: number | null = null;

  // In-Memory tracking
  let record = memoryStore.get(key);
  if (!record) {
    record = { timestamps: [], consecutiveFailures: 0, lockedUntil: null };
    memoryStore.set(key, record);
  }

  record.timestamps.push(now);
  record.consecutiveFailures += 1;
  consecutiveFailures = record.consecutiveFailures;

  if (record.consecutiveFailures >= config.limit) {
    // Trigger temporary lockout for lockoutSeconds (e.g. 15 minutes)
    lockedUntil = now + config.lockoutSeconds * 1000;
    record.lockedUntil = lockedUntil;
    isLocked = true;
  }

  // Upstash Redis sync if available
  if (upstashRedis) {
    try {
      if (isLocked && lockedUntil) {
        const lockoutKey = `compliscan:lockout:${key}`;
        await upstashRedis.set(lockoutKey, String(lockedUntil), { ex: config.lockoutSeconds });
      }
    } catch (e) {
      console.warn('[Upstash Redis] Failed to persist lockout state:', e);
    }
  }

  const remaining = Math.max(0, config.limit - consecutiveFailures);
  const resetSeconds = isLocked ? config.lockoutSeconds : config.windowSeconds;

  return {
    success: !isLocked,
    limit: config.limit,
    remaining,
    resetSeconds,
    isLocked,
    lockoutExpiresAt: lockedUntil || undefined,
    consecutiveFailures,
    errorMessage: isLocked
      ? `Account temporarily locked due to ${config.limit} consecutive failed attempts. Security cooldown active for ${Math.ceil(config.lockoutSeconds / 60)} minutes.`
      : `Invalid credentials. ${remaining} attempt(s) remaining before temporary lockout.`,
  };
}

/**
 * Resets consecutive failure count and clears active lockouts upon successful authentication.
 */
export async function recordAuthSuccess(
  action: AuthAction,
  ip: string,
  identifier?: string
): Promise<void> {
  const key = normalizeKey(action, ip, identifier);

  // Clear from in-memory store
  memoryStore.delete(key);

  // Clear from Upstash Redis if configured
  if (upstashRedis) {
    try {
      await upstashRedis.del(`compliscan:lockout:${key}`);
    } catch (e) {
      console.warn('[Upstash Redis] Failed to clear lockout on success:', e);
    }
  }
}

/**
 * Helper to construct standard RFC 6585 rate limiting and lockout HTTP headers.
 */
export function getAuthRateLimitHeaders(result: AuthRateLimitResult): Record<string, string> {
  const resetTimestamp = Math.floor((Date.now() + result.resetSeconds * 1000) / 1000);
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(Math.max(0, result.remaining)),
    'X-RateLimit-Reset': String(resetTimestamp),
  };

  if (result.isLocked || !result.success) {
    headers['Retry-After'] = String(result.resetSeconds);
  }

  return headers;
}

/**
 * Admin / Test helper: resets the in-memory and Redis rate limit / lockout for a key.
 */
export async function resetAuthLockout(action: AuthAction, ip: string, identifier?: string): Promise<void> {
  await recordAuthSuccess(action, ip, identifier);
}
