import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticateRequest, authorizeRole } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { sanitizeObject, sanitizeSlug } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(`dossiers-get:${ip}`, { limit: 120, windowMs: 60000 });
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded.' },
        { status: 429, headers: { 'Retry-After': String(rateCheck.resetSeconds) } }
      );
    }

    // 1. Server Session Authentication & Role Verification
    const authPayload = authenticateRequest(request);
    if (!authPayload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Valid inspector session required to access inspection records.' },
        { status: 401 }
      );
    }

    if (!authorizeRole(authPayload, ['ADMIN', 'SUPERVISOR', 'INSPECTOR'])) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient privileges to view inspection dossiers.' },
        { status: 403 }
      );
    }

    // 2. Role-Based Data Scoping (Defense against BOLA / IDOR)
    // Inspectors only access their own recorded dossiers; Supervisors & Admins can access all
    const filterWhere = authPayload.role === 'INSPECTOR'
      ? { inspectorId: authPayload.userId }
      : {};

    const dossiers = await prisma.inspectionDossier.findMany({
      where: filterWhere,
      include: { capturedAngles: true, violations: true, inspector: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, dossiers, authorizedAs: authPayload.role });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve dossiers.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(`dossiers-post:${ip}`, { limit: 60, windowMs: 60000 });
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please wait.' },
        { status: 429, headers: { 'Retry-After': String(rateCheck.resetSeconds) } }
      );
    }

    // 1. Server Session Authentication & Role Verification
    const authPayload = authenticateRequest(request);
    if (!authPayload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Active inspector session required to record judicial inspection dossiers.' },
        { status: 401 }
      );
    }

    if (!authorizeRole(authPayload, ['ADMIN', 'SUPERVISOR', 'INSPECTOR'])) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: User role does not possess regulatory filing authority.' },
        { status: 403 }
      );
    }

    // 2. Fetch Inspector identity strictly from verified server session (Never trust client body)
    const inspector = await prisma.inspector.findUnique({
      where: { id: authPayload.userId },
    });

    if (!inspector || !inspector.isActive) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Active inspector credential not found in central registry.' },
        { status: 403 }
      );
    }

    const rawBody = await request.json();
    const body = sanitizeObject(rawBody);

    const safeRefCode = sanitizeSlug(body.dossierReferenceCode) || `LM-2026-${Date.now().toString(36).toUpperCase()}`;

    // 3. Create Dossier bound securely to verified inspector.id from session
    const dossier = await prisma.inspectionDossier.create({
      data: {
        dossierReferenceCode: safeRefCode,
        inspectorId: inspector.id, // Derived strictly from verified server session!
        productName: String(body.productName || 'Unspecified Product').slice(0, 255),
        brandName: String(body.brandName || 'Unspecified Brand').slice(0, 255),
        category: body.category || 'FOOD_BEVERAGES',
        packagingGeometry: body.packagingGeometry || 'RECTANGULAR_BOX',
        containerHeightMm: parseFloat(body.containerHeightMm) || 0,
        containerWidthMm: body.containerWidthMm ? parseFloat(body.containerWidthMm) : null,
        circumferenceMm: body.circumferenceMm ? parseFloat(body.circumferenceMm) : null,
        pdpAreaCm2: parseFloat(body.pdpAreaCm2) || 0,
        declaredNetQuantity: parseFloat(body.declaredNetQuantity) || 0,
        declaredNetUnit: String(body.declaredNetUnit || 'g').slice(0, 20),
        declaredMrp: parseFloat(body.declaredMrp) || 0,
        declaredUspValue: body.declaredUspValue ? parseFloat(body.declaredUspValue) : null,
        declaredUspUnit: body.declaredUspUnit ? String(body.declaredUspUnit).slice(0, 50) : null,
        declaredMfgMonth: parseInt(body.declaredMfgMonth, 10) || 1,
        declaredMfgYear: parseInt(body.declaredMfgYear, 10) || new Date().getFullYear(),
        manufacturerName: body.manufacturerName ? String(body.manufacturerName).slice(0, 255) : null,
        manufacturerAddress: body.manufacturerAddress ? String(body.manufacturerAddress).slice(0, 500) : null,
        countryOfOrigin: body.countryOfOrigin ? String(body.countryOfOrigin).slice(0, 100) : 'India',
        consumerCarePhone: body.consumerCarePhone ? String(body.consumerCarePhone).slice(0, 50) : null,
        consumerCareEmail: body.consumerCareEmail ? String(body.consumerCareEmail).slice(0, 255) : null,
        detectedFontHeightMm: parseFloat(body.detectedFontHeightMm) || 2.5,
        complianceScore: parseFloat(body.complianceScore) || 0,
        verdict: body.verdict || 'REVIEW_REQUIRED',
        masterSha256Hash: sanitizeSlug(body.masterSha256Hash) || 'TAMPER_EVIDENT_HASH',
        deviceHardwareId: String(body.deviceHardwareId || 'DEVICE_ID').slice(0, 100),
        geoLatitude: body.geoLatitude ? parseFloat(body.geoLatitude) : null,
        geoLongitude: body.geoLongitude ? parseFloat(body.geoLongitude) : null,
        violations: {
          create: (body.violations || []).map((v: any) => ({
            statutoryRuleRef: String(v.statutoryRuleRef || 'Rule 6').slice(0, 100),
            severity: String(v.severity || 'MEDIUM').slice(0, 20),
            violationTitle: String(v.violationTitle || 'Violation').slice(0, 255),
            defectDescription: String(v.defectDescription || '').slice(0, 1000),
            detectedValue: v.detectedValue ? String(v.detectedValue).slice(0, 100) : null,
            requiredValue: String(v.requiredValue || '').slice(0, 100),
            croppedEvidenceUrl: v.croppedEvidenceUrl ? String(v.croppedEvidenceUrl).slice(0, 500) : null,
          })),
        },
      },
      include: { violations: true },
    });

    return NextResponse.json({ success: true, dossier });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to record inspection dossier.' },
      { status: 500 }
    );
  }
}
