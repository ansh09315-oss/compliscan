import {
  PackagingGeometry,
  VerdictStatus,
  SeverityLevel,
  ComplianceResult,
  ViolationRecord,
  RuleCheckResult,
} from '@/types/metrology';

// ─── Rule 7: PDP Area Calculation ────────────────────────────────────────────

export function calculatePDPArea(
  geometry: PackagingGeometry,
  heightMm: number,
  widthMm?: number,
  circumferenceMm?: number
): number {
  switch (geometry) {
    case PackagingGeometry.RECTANGULAR_BOX:
      return (heightMm * (widthMm ?? 0)) / 100;
    case PackagingGeometry.CYLINDRICAL_CONTAINER:
      return 0.40 * ((heightMm * (circumferenceMm ?? 0)) / 100);
    case PackagingGeometry.FLEXIBLE_POUCH:
      return (heightMm * (widthMm ?? 0)) / 100;
    case PackagingGeometry.IRREGULAR_SHAPE:
      return (heightMm * (widthMm ?? 0)) / 100;
    default:
      return 0;
  }
}

// ─── Rule 7: Minimum Font Height from PDP Area ──────────────────────────────

export function getMinimumFontHeight(pdpAreaCm2: number): number {
  if (pdpAreaCm2 <= 50) return 1.0;
  if (pdpAreaCm2 <= 100) return 1.5;
  if (pdpAreaCm2 <= 500) return 2.5;
  if (pdpAreaCm2 <= 2500) return 4.0;
  return 6.0;
}

// ─── Rule 6(11): USP Calculation ─────────────────────────────────────────────

export interface USPResult {
  statutoryUSP: number;
  expectedUnit: string;
}

export function calculateStatutoryUSP(
  mrp: number,
  netQuantity: number,
  unit: string
): USPResult {
  const normalizedUnit = unit.toLowerCase().trim();

  switch (normalizedUnit) {
    case 'g':
      if (netQuantity < 1000) {
        return {
          statutoryUSP: Math.round((mrp / netQuantity) * 100) / 100,
          expectedUnit: '₹ per g',
        };
      }
      return {
        statutoryUSP: Math.round((mrp / (netQuantity / 1000)) * 100) / 100,
        expectedUnit: '₹ per kg',
      };
    case 'kg':
      return {
        statutoryUSP: Math.round((mrp / netQuantity) * 100) / 100,
        expectedUnit: '₹ per kg',
      };
    case 'ml':
      if (netQuantity < 1000) {
        return {
          statutoryUSP: Math.round((mrp / netQuantity) * 100) / 100,
          expectedUnit: '₹ per ml',
        };
      }
      return {
        statutoryUSP: Math.round((mrp / (netQuantity / 1000)) * 100) / 100,
        expectedUnit: '₹ per l',
      };
    case 'l':
      return {
        statutoryUSP: Math.round((mrp / netQuantity) * 100) / 100,
        expectedUnit: '₹ per l',
      };
    case 'piece':
    case 'number':
    case 'n':
    case 'unit':
    case 'units':
      return {
        statutoryUSP: Math.round((mrp / netQuantity) * 100) / 100,
        expectedUnit: '₹ per piece',
      };
    default:
      return {
        statutoryUSP: Math.round((mrp / netQuantity) * 100) / 100,
        expectedUnit: `₹ per ${normalizedUnit}`,
      };
  }
}

// ─── Rule 6(1)(a): Manufacturer Completeness ─────────────────────────────────

export function validateManufacturerInfo(
  name?: string,
  address?: string
): { valid: boolean; details: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, details: 'Manufacturer/Packer legal entity name is missing' };
  }
  if (!address || address.trim().length === 0) {
    return { valid: false, details: 'Manufacturer/Packer postal address is missing' };
  }
  // Check for PIN code (6-digit Indian)
  const pinCodeRegex = /\b\d{6}\b/;
  if (!pinCodeRegex.test(address)) {
    return { valid: false, details: 'Manufacturer address missing 6-digit PIN code' };
  }
  return { valid: true, details: 'Manufacturer information complete with valid PIN code' };
}

// ─── Rule 6(2): Consumer Care Validation ─────────────────────────────────────

export function validateConsumerCare(
  phone?: string,
  email?: string
): { valid: boolean; details: string } {
  const rawPhone = String(phone || '').trim();
  const rawEmail = String(email || '').trim();

  // Search for email anywhere in email string OR phone string (handles composite strings)
  const emailRegex = /[a-zA-Z0-9_.+\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9.\-]+/;
  let detectedEmail: string | null = null;
  const emMatch = rawEmail.match(emailRegex) || rawPhone.match(emailRegex);
  if (emMatch) {
    detectedEmail = emMatch[0].replace(/[.,;:\)]+$/, '');
  }

  // Search for phone anywhere in phone string OR email string
  let detectedPhone: string | null = null;
  const combinedText = (rawPhone + ' ' + rawEmail).replace(/[(),\/]/g, ' ');

  // 1. Toll-Free: 1800 / 1860 with optional spaces/dashes
  const tollMatch = combinedText.match(/\b(?:1800|1860)[\s\-]?\d{3,4}[\s\-]?\d{3,4}\b/);
  // 2. Indian Mobile: (+91, 91, 0)? followed by 10 digits starting with 6-9 (supports spaces/dashes)
  const mobileMatch = combinedText.match(/(?:\+91[\s\-]?|91[\s\-]?|0)?[6-9]\d{1,4}[\s\-]?\d{4,8}\b/);
  // 3. Landline with STD code (e.g. 080-23456789)
  const landlineMatch = combinedText.match(/(?:\+91[\s\-]?|91[\s\-]?|0)?[1-9]\d{1,4}[\s\-]?\d{4,8}\b/);

  if (tollMatch) {
    detectedPhone = tollMatch[0].trim();
  } else if (mobileMatch) {
    const digits = mobileMatch[0].replace(/\D/g, '');
    if (digits.length >= 10 && digits.length <= 13) {
      detectedPhone = mobileMatch[0].trim();
    }
  } else if (landlineMatch) {
    const digits = landlineMatch[0].replace(/\D/g, '');
    if (digits.length >= 8 && digits.length <= 13) {
      detectedPhone = landlineMatch[0].trim();
    }
  } else {
    // Fallback: any contiguous 8-12 digit sequence
    const fallback = combinedText.match(/\b\d{8,12}\b/);
    if (fallback) detectedPhone = fallback[0];
  }

  const hasValidPhone = Boolean(detectedPhone);
  const hasValidEmail = Boolean(detectedEmail);

  if (!hasValidPhone && !hasValidEmail) {
    return { valid: false, details: 'Missing valid consumer care phone or email' };
  }

  if (hasValidPhone && hasValidEmail) {
    return { valid: true, details: `Consumer care verified: Phone (${detectedPhone}) & Email (${detectedEmail})` };
  } else if (hasValidPhone) {
    return { valid: true, details: `Consumer care phone verified (${detectedPhone})` };
  } else {
    return { valid: true, details: `Consumer care email verified (${detectedEmail})` };
  }
}


// ─── Master Compliance Evaluator ─────────────────────────────────────────────

export interface EvaluationInput {
  packagingGeometry: PackagingGeometry;
  containerHeightMm: number;
  containerWidthMm?: number;
  circumferenceMm?: number;
  declaredNetQuantity: number;
  declaredNetUnit: string;
  declaredMrp: number;
  declaredUspValue?: number;
  declaredUspUnit?: string;
  detectedFontHeightMm: number;
  manufacturerName?: string;
  manufacturerAddress?: string;
  consumerCarePhone?: string;
  consumerCareEmail?: string;
  declaredMfgMonth: number;
  declaredMfgYear: number;
  countryOfOrigin?: string;
}

export function evaluateCompliance(input: EvaluationInput): ComplianceResult {
  const violations: ViolationRecord[] = [];
  const ruleResults: RuleCheckResult[] = [];
  let totalRules = 0;
  let passedRules = 0;

  // ── Rule 7: PDP Area ──
  totalRules++;
  const pdpArea = calculatePDPArea(
    input.packagingGeometry,
    input.containerHeightMm,
    input.containerWidthMm,
    input.circumferenceMm
  );

  ruleResults.push({
    ruleId: 'RULE_7_PDP',
    ruleLabel: 'Rule 7 - PDP Area Calculation',
    passed: pdpArea > 0,
    details: `PDP Area = ${pdpArea.toFixed(2)} cm²`,
  });
  if (pdpArea > 0) passedRules++;

  // ── Rule 7: Font Height ──
  totalRules++;
  const minFontHeight = getMinimumFontHeight(pdpArea);
  const fontPassed = input.detectedFontHeightMm >= minFontHeight;
  ruleResults.push({
    ruleId: 'RULE_7_FONT',
    ruleLabel: 'Rule 7 - Minimum Font Height',
    passed: fontPassed,
    details: `Minimum required: ${minFontHeight}mm, Detected: ${input.detectedFontHeightMm}mm`,
    severity: fontPassed ? undefined : SeverityLevel.HIGH,
  });
  if (fontPassed) {
    passedRules++;
  } else {
    violations.push({
      statutoryRuleRef: 'Rule 7',
      severity: SeverityLevel.HIGH,
      violationTitle: 'Font Height Below Minimum',
      defectDescription: `Detected font height ${input.detectedFontHeightMm}mm is below the statutory minimum ${minFontHeight}mm for PDP area ${pdpArea.toFixed(2)} cm²`,
      detectedValue: `${input.detectedFontHeightMm}mm`,
      requiredValue: `≥ ${minFontHeight}mm`,
    });
  }

  // ── Rule 6(11): USP ──
  totalRules++;
  if (input.declaredUspValue !== undefined && input.declaredUspValue !== null) {
    const uspResult = calculateStatutoryUSP(
      input.declaredMrp,
      input.declaredNetQuantity,
      input.declaredNetUnit
    );
    const uspDiscrepancy = Math.abs(input.declaredUspValue - uspResult.statutoryUSP);
    const uspPassed = uspDiscrepancy <= 0.05;

    ruleResults.push({
      ruleId: 'RULE_6_11_USP',
      ruleLabel: 'Rule 6(11) - Unit Sale Price',
      passed: uspPassed,
      details: `Statutory USP: ${uspResult.statutoryUSP} (${uspResult.expectedUnit}), Declared: ${input.declaredUspValue}`,
      severity: uspPassed ? undefined : SeverityLevel.HIGH,
    });

    if (uspPassed) {
      passedRules++;
    } else {
      violations.push({
        statutoryRuleRef: 'Rule 6(11)',
        severity: SeverityLevel.HIGH,
        violationTitle: 'Unit Sale Price Discrepancy',
        defectDescription: `Declared USP ₹${input.declaredUspValue} differs from statutory USP ₹${uspResult.statutoryUSP} (${uspResult.expectedUnit}) by ₹${uspDiscrepancy.toFixed(2)}`,
        detectedValue: `₹${input.declaredUspValue}`,
        requiredValue: `₹${uspResult.statutoryUSP} (${uspResult.expectedUnit})`,
      });
    }
  } else {
    ruleResults.push({
      ruleId: 'RULE_6_11_USP',
      ruleLabel: 'Rule 6(11) - Unit Sale Price',
      passed: false,
      details: 'USP declaration is missing from packaging',
      severity: SeverityLevel.MEDIUM,
    });
    violations.push({
      statutoryRuleRef: 'Rule 6(11)',
      severity: SeverityLevel.MEDIUM,
      violationTitle: 'Missing Unit Sale Price',
      defectDescription: 'Unit Sale Price (USP) declaration is not present on the packaging',
      requiredValue: 'USP must be declared per Rule 6(11)',
    });
  }

  // ── Rule 6(1)(a): Manufacturer Info ──
  totalRules++;
  const mfgResult = validateManufacturerInfo(input.manufacturerName, input.manufacturerAddress);
  ruleResults.push({
    ruleId: 'RULE_6_1A_MFG',
    ruleLabel: 'Rule 6(1)(a) - Manufacturer Details',
    passed: mfgResult.valid,
    details: mfgResult.details,
    severity: mfgResult.valid ? undefined : SeverityLevel.CRITICAL,
  });
  if (mfgResult.valid) {
    passedRules++;
  } else {
    violations.push({
      statutoryRuleRef: 'Rule 6(1)(a)',
      severity: SeverityLevel.CRITICAL,
      violationTitle: 'Incomplete Manufacturer Information',
      defectDescription: mfgResult.details,
      requiredValue: 'Full legal entity name with postal address including PIN code',
    });
  }

  // ── Rule 6(2): Consumer Care ──
  totalRules++;
  const ccResult = validateConsumerCare(input.consumerCarePhone, input.consumerCareEmail);
  ruleResults.push({
    ruleId: 'RULE_6_2_CC',
    ruleLabel: 'Rule 6(2) - Consumer Care',
    passed: ccResult.valid,
    details: ccResult.details,
    severity: ccResult.valid ? undefined : SeverityLevel.HIGH,
  });
  if (ccResult.valid) {
    passedRules++;
  } else {
    violations.push({
      statutoryRuleRef: 'Rule 6(2)',
      severity: SeverityLevel.HIGH,
      violationTitle: 'Missing Consumer Care Information',
      defectDescription: ccResult.details,
      requiredValue: 'Valid phone (+91/1800) and email address',
    });
  }

  // ── Rule 6: Net Quantity Declaration ──
  totalRules++;
  const netQtyPassed = input.declaredNetQuantity > 0 && input.declaredNetUnit.trim().length > 0;
  ruleResults.push({
    ruleId: 'RULE_6_NETQTY',
    ruleLabel: 'Rule 6 - Net Quantity Declaration',
    passed: netQtyPassed,
    details: netQtyPassed
      ? `Net Qty: ${input.declaredNetQuantity} ${input.declaredNetUnit}`
      : 'Net quantity or unit not properly declared',
  });
  if (netQtyPassed) passedRules++;

  // ── Rule 6: MRP Declaration ──
  totalRules++;
  const mrpPassed = input.declaredMrp > 0;
  ruleResults.push({
    ruleId: 'RULE_6_MRP',
    ruleLabel: 'Rule 6 - MRP Declaration',
    passed: mrpPassed,
    details: mrpPassed ? `MRP: ₹${input.declaredMrp}` : 'MRP not declared or zero',
  });
  if (mrpPassed) passedRules++;

  // ── Rule 6: Manufacturing Date ──
  totalRules++;
  const mfgDatePassed =
    input.declaredMfgMonth >= 1 &&
    input.declaredMfgMonth <= 12 &&
    input.declaredMfgYear >= 2000 &&
    input.declaredMfgYear <= new Date().getFullYear() + 1;
  ruleResults.push({
    ruleId: 'RULE_6_MFGDATE',
    ruleLabel: 'Rule 6 - Manufacturing Date',
    passed: mfgDatePassed,
    details: mfgDatePassed
      ? `Mfg: ${String(input.declaredMfgMonth).padStart(2, '0')}/${input.declaredMfgYear}`
      : 'Invalid or missing manufacturing date',
  });
  if (mfgDatePassed) passedRules++;

  // ── Rule 8: Country of Origin ──
  totalRules++;
  const cooPassed = !!input.countryOfOrigin && input.countryOfOrigin.trim().length > 0;
  ruleResults.push({
    ruleId: 'RULE_8_COO',
    ruleLabel: 'Rule 8 - Country of Origin',
    passed: cooPassed,
    details: cooPassed ? `Country: ${input.countryOfOrigin}` : 'Country of origin not declared',
    severity: cooPassed ? undefined : SeverityLevel.MEDIUM,
  });
  if (cooPassed) {
    passedRules++;
  } else {
    violations.push({
      statutoryRuleRef: 'Rule 8',
      severity: SeverityLevel.MEDIUM,
      violationTitle: 'Missing Country of Origin',
      defectDescription: 'Country of origin is not declared on the packaging',
      requiredValue: 'Country of origin must be declared',
    });
  }

  // ── Calculate Overall Score & Verdict ──
  const overallScore = totalRules > 0 ? Math.round((passedRules / totalRules) * 100) : 0;

  let verdict: VerdictStatus;
  if (overallScore === 100) {
    verdict = VerdictStatus.COMPLIANT;
  } else if (overallScore >= 70) {
    verdict = VerdictStatus.PARTIALLY_COMPLIANT;
  } else if (violations.some((v) => v.severity === SeverityLevel.CRITICAL)) {
    verdict = VerdictStatus.NON_COMPLIANT;
  } else if (overallScore < 50) {
    verdict = VerdictStatus.NON_COMPLIANT;
  } else {
    verdict = VerdictStatus.REVIEW_REQUIRED;
  }

  return { overallScore, verdict, ruleResults, violations };
}
