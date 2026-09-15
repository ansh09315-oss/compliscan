import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create inspector
  const inspector = await prisma.inspector.upsert({
    where: { badgeNumber: '1045' },
    update: {},
    create: {
      badgeNumber: '1045',
      fullName: 'Rajesh Kumar Sharma',
      email: 'rk.sharma@legalmetrology.gov.in',
      assignedDistrict: 'Central Delhi',
      stateTerritory: 'Delhi NCT',
    },
  });

  console.log('Created inspector:', inspector.fullName);

  // Seed inspections
  const inspections = [
    {
      dossierReferenceCode: 'LM-2026-847291',
      productName: 'Parle-G Gold Biscuits',
      brandName: 'Parle',
      category: 'FOOD_BEVERAGES',
      packagingGeometry: 'RECTANGULAR_BOX',
      containerHeightMm: 200,
      containerWidthMm: 140,
      pdpAreaCm2: 280,
      declaredNetQuantity: 500,
      declaredNetUnit: 'g',
      declaredMrp: 40,
      declaredUspValue: 0.08,
      declaredMfgMonth: 8,
      declaredMfgYear: 2026,
      manufacturerName: 'Parle Products Pvt. Ltd.',
      manufacturerAddress: 'Vile Parle East, Mumbai, Maharashtra 400057',
      countryOfOrigin: 'India',
      consumerCarePhone: '18001031045',
      consumerCareEmail: 'consumer@parle.com',
      detectedFontHeightMm: 2.8,
      complianceScore: 100,
      verdict: 'COMPLIANT',
      masterSha256Hash: 'a1b2c3d4e5f6789012345678abcdef0123456789abcdef0123456789abcdef01',
      deviceHardwareId: 'DEV-SEED-001',
    },
    {
      dossierReferenceCode: 'LM-2026-729384',
      productName: 'Fortune Sunlite Oil',
      brandName: 'Fortune',
      category: 'FOOD_BEVERAGES',
      packagingGeometry: 'CYLINDRICAL_CONTAINER',
      containerHeightMm: 280,
      circumferenceMm: 320,
      pdpAreaCm2: 358.4,
      declaredNetQuantity: 1000,
      declaredNetUnit: 'ml',
      declaredMrp: 180,
      declaredUspValue: 0.15,
      declaredMfgMonth: 7,
      declaredMfgYear: 2026,
      manufacturerName: 'Adani Wilmar Ltd.',
      manufacturerAddress: 'Fortune House, Ahmedabad, Gujarat 380015',
      detectedFontHeightMm: 2.2,
      complianceScore: 78,
      verdict: 'PARTIALLY_COMPLIANT',
      masterSha256Hash: 'b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef02',
      deviceHardwareId: 'DEV-SEED-002',
    },
    {
      dossierReferenceCode: 'LM-2026-618273',
      productName: 'Dove Body Wash',
      brandName: 'Dove',
      category: 'PERSONAL_CARE_COSMETICS',
      packagingGeometry: 'CYLINDRICAL_CONTAINER',
      containerHeightMm: 180,
      circumferenceMm: 220,
      pdpAreaCm2: 158.4,
      declaredNetQuantity: 250,
      declaredNetUnit: 'ml',
      declaredMrp: 299,
      detectedFontHeightMm: 1.5,
      declaredMfgMonth: 6,
      declaredMfgYear: 2026,
      complianceScore: 44,
      verdict: 'NON_COMPLIANT',
      masterSha256Hash: 'c3d4e5f6789012345678abcdef0123456789abcdef0123456789abcdef0103',
      deviceHardwareId: 'DEV-SEED-003',
    },
  ];

  for (const insp of inspections) {
    const existing = await prisma.inspectionDossier.findUnique({
      where: { dossierReferenceCode: insp.dossierReferenceCode },
    });
    if (!existing) {
      await prisma.inspectionDossier.create({
        data: {
          ...insp,
          inspectorId: inspector.id,
        },
      });
      console.log('Seeded:', insp.dossierReferenceCode);
    }
  }

  // Add violations for the non-compliant dossier
  const doveDossier = await prisma.inspectionDossier.findUnique({
    where: { dossierReferenceCode: 'LM-2026-618273' },
  });
  if (doveDossier) {
    const existingViolations = await prisma.violationRecord.count({
      where: { dossierId: doveDossier.id },
    });
    if (existingViolations === 0) {
      await prisma.violationRecord.createMany({
        data: [
          {
            dossierId: doveDossier.id,
            statutoryRuleRef: 'Rule 7',
            severity: 'HIGH',
            violationTitle: 'Font Height Below Minimum',
            defectDescription: 'Detected font height 1.5mm is below the statutory minimum 2.5mm for PDP area 158.4 cm²',
            detectedValue: '1.5mm',
            requiredValue: '≥ 2.5mm',
          },
          {
            dossierId: doveDossier.id,
            statutoryRuleRef: 'Rule 6(11)',
            severity: 'MEDIUM',
            violationTitle: 'Missing Unit Sale Price',
            defectDescription: 'Unit Sale Price (USP) declaration is not present on the packaging',
            requiredValue: 'USP must be declared per Rule 6(11)',
          },
        ],
      });
      console.log('Seeded violations for Dove Body Wash');
    }
  }

  console.log('Database seed completed!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
