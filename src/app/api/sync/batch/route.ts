import { NextResponse } from 'next/server';
import { authenticateRequest, authorizeRole } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { sanitizeObject, sanitizeSlug } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(`sync:${ip}`, { limit: 60, windowMs: 60000 });
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: 'Sync rate limit exceeded. Please wait a moment.' },
        { status: 429, headers: { 'Retry-After': String(rateCheck.resetSeconds) } }
      );
    }

    // 1. Server Session Authentication & Role Verification
    const authPayload = authenticateRequest(request);
    if (!authPayload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Valid inspector session required for batch data synchronization.' },
        { status: 401 }
      );
    }

    if (!authorizeRole(authPayload, ['ADMIN', 'SUPERVISOR', 'INSPECTOR'])) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient privileges to perform offline batch synchronization.' },
        { status: 403 }
      );
    }

    const rawBody = await request.json().catch(() => ({}));
    const body = sanitizeObject(rawBody);
    const { items } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid items array.' },
        { status: 400 }
      );
    }

    if (items.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Batch exceeds maximum allowable limit of 100 items.' },
        { status: 400 }
      );
    }

    // Process sanitized batch sync items
    const results = items.map((item: any) => ({
      id: sanitizeSlug(item.id),
      dossierReferenceCode: sanitizeSlug(item.dossierReferenceCode),
      status: 'synced',
      syncedAt: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      syncedCount: results.length,
      syncedBy: {
        id: authPayload.userId,
        badgeNumber: authPayload.badgeNumber,
        role: authPayload.role,
      },
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to process batch sync.' },
      { status: 500 }
    );
  }
}
