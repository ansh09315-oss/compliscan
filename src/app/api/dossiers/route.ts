import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dossiers = await prisma.inspectionDossier.findMany({
      include: { capturedAngles: true, violations: true, inspector: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json({ success: true, dossiers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Ensure inspector exists
    let inspector = await prisma.inspector.findUnique({
      where: { badgeNumber: body.inspectorBadge || '1045' },
    });

    if (!inspector) {
      inspector = await prisma.inspector.create({
        data: {
          badgeNumber: body.inspectorBadge || '1045',
          fullName: body.inspectorName || 'Rajesh Kumar Sharma',
          email: body.inspectorEmail || 'rk.sharma@legalmetrology.gov.in',
          assignedDistrict: body.district || 'Central Delhi',
        },
      });
    }

    const dossier = await prisma.inspectionDossier.create({
      data: {
        dossierReferenceCode: body.dossierReferenceCode,
        inspectorId: inspector.id,
        productName: body.productName,
        brandName: body.brandName,
        category: body.category,
        packagingGeometry: body.packagingGeometry,
        containerHeightMm: body.containerHeightMm,
        containerWidthMm: body.containerWidthMm,
        circumferenceMm: body.circumferenceMm,
        pdpAreaCm2: body.pdpAreaCm2,
        declaredNetQuantity: body.declaredNetQuantity,
        declaredNetUnit: body.declaredNetUnit,
        declaredMrp: body.declaredMrp,
        declaredUspValue: body.declaredUspValue,
        declaredUspUnit: body.declaredUspUnit,
        declaredMfgMonth: body.declaredMfgMonth,
        declaredMfgYear: body.declaredMfgYear,
        manufacturerName: body.manufacturerName,
        manufacturerAddress: body.manufacturerAddress,
        countryOfOrigin: body.countryOfOrigin,
        consumerCarePhone: body.consumerCarePhone,
        consumerCareEmail: body.consumerCareEmail,
        detectedFontHeightMm: body.detectedFontHeightMm,
        complianceScore: body.complianceScore,
        verdict: body.verdict,
        masterSha256Hash: body.masterSha256Hash,
        deviceHardwareId: body.deviceHardwareId,
        geoLatitude: body.geoLatitude,
        geoLongitude: body.geoLongitude,
        violations: {
          create: (body.violations || []).map((v: any) => ({
            statutoryRuleRef: v.statutoryRuleRef,
            severity: v.severity,
            violationTitle: v.violationTitle,
            defectDescription: v.defectDescription,
            detectedValue: v.detectedValue,
            requiredValue: v.requiredValue,
            croppedEvidenceUrl: v.croppedEvidenceUrl,
          })),
        },
      },
      include: { violations: true },
    });

    return NextResponse.json({ success: true, dossier });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
