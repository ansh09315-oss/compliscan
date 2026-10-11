import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword, generateSalt, signToken, UserRole } from '@/lib/auth';
import { validatePassword } from '@/lib/passwordPolicy';
import {
  checkAuthRateLimit,
  recordAuthFailure,
  recordAuthSuccess,
  getAuthRateLimitHeaders,
} from '@/lib/authRateLimit';
import { getClientIp } from '@/lib/rateLimit';
import { sanitizeInput } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/signup
 * Registers a new Legal Metrology officer with Upstash rate limiting and temporary lockout.
 * Sensible Limit: 3 attempts / 15 minutes per IP.
 */
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const body = await request.json().catch(() => ({}));

    const badgeNumber = sanitizeInput(body.badgeNumber || '').trim().toUpperCase();
    const fullName = sanitizeInput(body.fullName || '').trim();
    const email = sanitizeInput(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const assignedDistrict = sanitizeInput(body.assignedDistrict || 'Central Division').trim();
    const stateTerritory = sanitizeInput(body.stateTerritory || 'Delhi NCT').trim();

    // 1. Rate Limiting Check (3 attempts / 15 min per IP)
    const rateCheck = await checkAuthRateLimit('signup', ip, 'ip_registration');
    const rateHeaders = getAuthRateLimitHeaders(rateCheck);

    if (!rateCheck.success || rateCheck.isLocked) {
      return NextResponse.json(
        {
          success: false,
          error: rateCheck.errorMessage,
          locked: rateCheck.isLocked,
          retryAfterSeconds: rateCheck.resetSeconds,
        },
        { status: 429, headers: rateHeaders }
      );
    }

    // 2. Validate Required Fields
    if (!badgeNumber || !fullName || !email || !password) {
      const failResult = await recordAuthFailure('signup', ip, 'ip_registration');
      return NextResponse.json(
        {
          success: false,
          error: 'Badge number, full name, official email, and password are required.',
          remainingAttempts: failResult.remaining,
        },
        { status: 400, headers: getAuthRateLimitHeaders(failResult) }
      );
    }

    // 2. Validate Password Policy (Minimum 12 Chars + HaveIBeenPwned Leaked Password Check)
    const pwdValidation = await validatePassword(password, true);
    if (!pwdValidation.valid) {
      const failResult = await recordAuthFailure('signup', ip, 'ip_registration');
      return NextResponse.json(
        {
          success: false,
          error: pwdValidation.errors[0] || 'Password does not satisfy regulatory security requirements.',
          errors: pwdValidation.errors,
          isBreached: pwdValidation.isBreached,
          breachCount: pwdValidation.breachCount,
          remainingAttempts: failResult.remaining,
        },
        { status: 400, headers: getAuthRateLimitHeaders(failResult) }
      );
    }

    // 3. Check for Duplicate Inspector Record
    const existing = await prisma.inspector.findFirst({
      where: {
        OR: [{ badgeNumber }, { email }],
      },
    });

    if (existing) {
      const failResult = await recordAuthFailure('signup', ip, 'ip_registration');
      return NextResponse.json(
        {
          success: false,
          error: 'Officer with this badge number or official email is already registered.',
          remainingAttempts: failResult.remaining,
        },
        { status: 409, headers: getAuthRateLimitHeaders(failResult) }
      );
    }

    // 4. Cryptographic Password Hashing (PBKDF2 SHA-512)
    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);

    const inspector = await prisma.inspector.create({
      data: {
        badgeNumber,
        fullName,
        email,
        passwordHash,
        salt,
        role: 'INSPECTOR',
        assignedDistrict,
        stateTerritory,
        publicKey: `RSA-2048-GOV-${badgeNumber}`,
        isActive: true,
      },
    });

    // 5. Successful Signup: Clear any failure counters
    await recordAuthSuccess('signup', ip, 'ip_registration');

    // 6. Issue Session Token & Set httpOnly Cookie
    const token = signToken({
      userId: inspector.id,
      badgeNumber: inspector.badgeNumber,
      fullName: inspector.fullName,
      role: 'INSPECTOR' as UserRole,
      assignedDistrict: inspector.assignedDistrict,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: 'Inspector account created successfully.',
        inspector: {
          id: inspector.id,
          badgeNumber: inspector.badgeNumber,
          fullName: inspector.fullName,
          email: inspector.email,
          role: inspector.role,
          assignedDistrict: inspector.assignedDistrict,
        },
      },
      {
        status: 201,
        headers: getAuthRateLimitHeaders({
          success: true,
          limit: 3,
          remaining: 3,
          resetSeconds: 900,
          isLocked: false,
          consecutiveFailures: 0,
        }),
      }
    );

    response.cookies.set({
      name: 'compliscan_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Registration failed due to server error.' },
      { status: 500 }
    );
  }
}
