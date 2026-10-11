import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticateRequest, authorizeRole } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 1. Rate limiting
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(`telemetry:${ip}`, { limit: 120, windowMs: 60000 });
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please slow down.' },
        { status: 429, headers: { 'Retry-After': String(rateCheck.resetSeconds) } }
      );
    }

    // 2. Server Session Authentication & Role Verification
    const authPayload = authenticateRequest(request);
    if (!authPayload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Valid inspector session required to access telemetry and compliance metrics.' },
        { status: 401 }
      );
    }

    if (!authorizeRole(authPayload, ['ADMIN', 'SUPERVISOR', 'INSPECTOR'])) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient privileges to view executive telemetry.' },
        { status: 403 }
      );
    }

    // 3. Role-Based Data Scoping (Defense against BOLA)
    // Field inspectors see their own activity KPIs; Admins & Supervisors view jurisdiction-wide totals
    const dossierFilter = authPayload.role === 'INSPECTOR'
      ? { inspectorId: authPayload.userId }
      : {};

    const violationFilter = authPayload.role === 'INSPECTOR'
      ? { dossier: { inspectorId: authPayload.userId } }
      : {};

    const totalInspections = await prisma.inspectionDossier.count({ where: dossierFilter });
    const totalViolations = await prisma.violationRecord.count({ where: violationFilter });
    const pendingReviews = await prisma.inspectionDossier.count({
      where: { ...dossierFilter, verdict: 'REVIEW_REQUIRED' },
    });
    const compliantCount = await prisma.inspectionDossier.count({
      where: { ...dossierFilter, verdict: 'COMPLIANT' },
    });
    const complianceRate = totalInspections > 0
      ? Math.round((compliantCount / totalInspections) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      kpis: { totalInspections, totalViolations, pendingReviews, complianceRate },
      scope: authPayload.role === 'INSPECTOR' ? 'OFFICER_ASSIGNED' : 'JURISDICTION_GLOBAL',
      authorizedUser: {
        id: authPayload.userId,
        badgeNumber: authPayload.badgeNumber,
        role: authPayload.role,
        assignedDistrict: authPayload.assignedDistrict,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve telemetry data.' },
      { status: 500 }
    );
  }
}
