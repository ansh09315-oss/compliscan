import crypto from 'crypto';

export type UserRole = 'ADMIN' | 'INSPECTOR' | 'SUPERVISOR';

export interface TokenPayload {
  userId: string;
  badgeNumber: string;
  fullName: string;
  role: UserRole;
  assignedDistrict: string;
  iat: number;
  exp: number;
}

// Fallback HMAC secret for signing auth tokens (loaded from env in production)
const JWT_SECRET = process.env.AUTH_SECRET || process.env.JWT_SECRET || 'compliscan_sec_gov_ind_legal_metrology_key_2026';
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = 'sha512';

/**
 * Generates a cryptographically random salt.
 */
export function generateSalt(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hashes a plaintext password using PBKDF2 with SHA-512 and per-user salt.
 */
export function hashPassword(password: string, salt: string): string {
  return crypto
    .pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST)
    .toString('hex');
}

/**
 * Constant-time verification of candidate password against stored hash.
 */
export function verifyPassword(candidatePassword: string, storedHash: string, salt: string): boolean {
  try {
    const candidateHash = hashPassword(candidatePassword, salt);
    const candidateBuffer = Buffer.from(candidateHash, 'hex');
    const storedBuffer = Buffer.from(storedHash, 'hex');

    if (candidateBuffer.length !== storedBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(candidateBuffer, storedBuffer);
  } catch {
    return false;
  }
}

/**
 * Base64URL encoding helper.
 */
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Base64URL decoding helper.
 */
function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return Buffer.from(str, 'base64').toString('utf8');
}

/**
 * Issues a cryptographically signed HMAC-SHA256 JWT token.
 */
export function signToken(payload: Omit<TokenPayload, 'iat' | 'exp'>, expiresInSeconds = 86400): string {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: TokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verifies and decodes a signed JWT token.
 * Returns null if token is tampered, invalid, or expired.
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const sigA = Buffer.from(signature);
    const sigB = Buffer.from(expectedSignature);
    if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) {
      return null;
    }

    const payload: TokenPayload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies auth token from secure httpOnly cookies or Authorization header.
 * Primary: httpOnly 'compliscan_session' cookie (immune to client-side XSS).
 * Fallback: 'Authorization: Bearer <token>' for external API clients.
 */
export function authenticateRequest(request: Request): TokenPayload | null {
  let token: string | null = null;

  // 1. Check secure httpOnly cookies first
  const cookieHeader = request.headers.get('cookie') || request.headers.get('Cookie') || '';
  if (cookieHeader) {
    const sessionMatch = cookieHeader.match(/(?:^|;\s*)compliscan_session=([^;]+)/);
    if (sessionMatch) {
      token = decodeURIComponent(sessionMatch[1]);
    }
  }

  // NextRequest cookies helper if available
  if (!token && 'cookies' in request && typeof (request as any).cookies?.get === 'function') {
    const c = (request as any).cookies.get('compliscan_session');
    if (c?.value) {
      token = c.value;
    }
  }

  // 2. Fallback to Authorization header for external API compatibility
  if (!token) {
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

/**
 * Role checking helper.
 */
export function authorizeRole(payload: TokenPayload | null, allowedRoles: UserRole[]): boolean {
  if (!payload) return false;
  return allowedRoles.includes(payload.role);
}
