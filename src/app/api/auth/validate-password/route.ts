import { NextResponse } from 'next/server';
import { validatePassword } from '@/lib/passwordPolicy';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/validate-password
 * Validates candidate password against length 12 policy and HaveIBeenPwned breach database.
 * Used by Sign-Up UI for real-time strength indicators and breach warnings.
 */
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    // Rate limit password validation to 60 calls/minute per IP
    const rateCheck = checkRateLimit(`pwd-val:${ip}`, { limit: 60, windowMs: 60000 });
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: 'Validation rate limit reached. Please wait.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const password = String(body.password || '');

    const result = await validatePassword(password, true);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Password validation failed.' },
      { status: 500 }
    );
  }
}
