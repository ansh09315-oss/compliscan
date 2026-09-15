import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const totalInspections = await prisma.inspectionDossier.count();
    const totalViolations = await prisma.violationRecord.count();
    const pendingReviews = await prisma.inspectionDossier.count({
      where: { verdict: 'REVIEW_REQUIRED' },
    });
    const compliantCount = await prisma.inspectionDossier.count({
      where: { verdict: 'COMPLIANT' },
    });
    const complianceRate = totalInspections > 0
      ? Math.round((compliantCount / totalInspections) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      kpis: { totalInspections, totalViolations, pendingReviews, complianceRate },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
