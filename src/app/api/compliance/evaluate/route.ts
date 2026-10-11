import { NextResponse } from 'next/server';
import { evaluateCompliance, type EvaluationInput } from '@/lib/complianceEngine';
import { authenticateRequest, authorizeRole } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { sanitizeObject } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(`eval:${ip}`, { limit: 120, windowMs: 60000 });
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please wait a moment.' },
        { status: 429, headers: { 'Retry-After': String(rateCheck.resetSeconds) } }
      );
    }

    // 1. Server Session Authentication & Role Verification
    const authPayload = authenticateRequest(request);
    if (!authPayload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Active inspector session required to evaluate statutory compliance.' },
        { status: 401 }
      );
    }

    if (!authorizeRole(authPayload, ['ADMIN', 'SUPERVISOR', 'INSPECTOR'])) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient privileges to perform statutory rule evaluations.' },
        { status: 403 }
      );
    }

    const rawBody = await request.json().catch(() => ({}));
    const sanitizedBody: EvaluationInput = sanitizeObject(rawBody);

    const result = evaluateCompliance(sanitizedBody);
    return NextResponse.json({
      success: true,
      result,
      evaluatedBy: {
        userId: authPayload.userId,
        badgeNumber: authPayload.badgeNumber,
        role: authPayload.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Evaluation failed due to malformed input.' },
      { status: 400 }
    );
  }
}
