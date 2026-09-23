// ─── Enumerations ────────────────────────────────────────────────────────────

export enum CommodityCategory {
  FOOD_BEVERAGES = 'FOOD_BEVERAGES',
  PERSONAL_CARE_COSMETICS = 'PERSONAL_CARE_COSMETICS',
  HOUSEHOLD_CHEMICALS = 'HOUSEHOLD_CHEMICALS',
  PHARMACEUTICALS = 'PHARMACEUTICALS',
  ELECTRONICS_HARDWARE = 'ELECTRONICS_HARDWARE',
  OTHER = 'OTHER',
}

export enum PackagingGeometry {
  RECTANGULAR_BOX = 'RECTANGULAR_BOX',
  CYLINDRICAL_CONTAINER = 'CYLINDRICAL_CONTAINER',
  FLEXIBLE_POUCH = 'FLEXIBLE_POUCH',
  IRREGULAR_SHAPE = 'IRREGULAR_SHAPE',
}

export enum VerdictStatus {
  COMPLIANT = 'COMPLIANT',
  PARTIALLY_COMPLIANT = 'PARTIALLY_COMPLIANT',
  NON_COMPLIANT = 'NON_COMPLIANT',
  REVIEW_REQUIRED = 'REVIEW_REQUIRED',
}

export enum SeverityLevel {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export type AngleType = 'FRONT' | 'BACK' | 'REGULATORY_SIDE' | 'MRP_BATCH' | 'ADDITIONAL';

// ─── Domain Interfaces ───────────────────────────────────────────────────────

export interface Inspector {
  id: string;
  badgeNumber: string;
  fullName: string;
  email: string;
  assignedDistrict: string;
  stateTerritory: string;
  publicKey: string;
  isActive: boolean;
  createdAt: string;
}

export interface CapturedAngle {
  id?: string;
  angleType: AngleType;
  imageDataUrl: string;
  sha256Hash: string;
  opticalWidth: number;
  opticalHeight: number;
}

export interface ExtractedField {
  fieldName: string;
  displayLabel: string;
  value: string;
  confidence: number;
  isEditable: boolean;
  unit?: string;
}

export interface ViolationRecord {
  id?: string;
  statutoryRuleRef: string;
  severity: SeverityLevel;
  violationTitle: string;
  defectDescription: string;
  detectedValue?: string;
  requiredValue: string;
  croppedEvidenceUrl?: string;
}

export interface ComplianceResult {
  overallScore: number;
  verdict: VerdictStatus;
  ruleResults: RuleCheckResult[];
  violations: ViolationRecord[];
}

export interface RuleCheckResult {
  ruleId: string;
  ruleLabel: string;
  passed: boolean;
  details: string;
  severity?: SeverityLevel;
}

export interface InspectionDossier {
  id?: string;
  dossierReferenceCode: string;
  inspectorId: string;
  inspectionTimestamp: string;

  // Product Identification
  productName: string;
  brandName: string;
  category: CommodityCategory;
  packagingGeometry: PackagingGeometry;

  // Spatial Dimensions & PDP
  containerHeightMm: number;
  containerWidthMm?: number;
  circumferenceMm?: number;
  pdpAreaCm2: number;

  // Extracted Declarations
  declaredNetQuantity: number;
  declaredNetUnit: string;
  declaredMrp: number;
  declaredUspValue?: number;
  declaredUspUnit?: string;
  declaredMfgMonth: number;
  declaredMfgYear: number;
  manufacturerName?: string;
  manufacturerAddress?: string;
  countryOfOrigin?: string;
  consumerCarePhone?: string;
  consumerCareEmail?: string;

  // Verification Results
  detectedFontHeightMm: number;
  complianceScore: number;
  verdict: VerdictStatus;

  // Section 63 BSA 2023
  masterSha256Hash: string;
  deviceHardwareId: string;
  geoLatitude?: number;
  geoLongitude?: number;
  isTamperEvident: boolean;

  // Offline Sync
  isSyncedToCentral: boolean;
  syncedAt?: string;

  // Relations
  capturedAngles: CapturedAngle[];
  violations: ViolationRecord[];

  // Inspector Field Observations
  inspectorRemarks?: string;

  // Multi-Image Contextual Stitching (FSSAI, Nutrition, Claims, Ingredients)
  comprehensiveDetails?: ComprehensiveProductDetails;
}

export interface ComprehensiveProductDetails {
  productOverview?: {
    brandName?: string;
    productName?: string;
    variant?: string;
    dietaryClassification?: string;
    keyClaims?: string[];
  };
  pricingAndBatch?: {
    netWeight?: string;
    mrp?: number;
    usp?: string;
    mfgDate?: string;
    useByDate?: string;
    lotOrBatchNo?: string;
    barcode?: string;
  };
  nutritionalInfoPer100g?: {
    energyKcal?: number | null;
    proteinG?: number | null;
    totalCarbohydrateG?: number | null;
    totalSugarG?: number | null;
    addedSugarG?: number | null;
    totalFatG?: number | null;
  };
  ingredientsAndAllergens?: {
    ingredientsList?: string;
    allergenAdvice?: string;
    manufacturingWarning?: string;
  };
  manufacturerDetails?: {
    companyName?: string;
    completeAddress?: string;
    fssaiLicenseNo?: string;
    customerCarePhone?: string;
    customerCareEmail?: string;
  };
}

export interface DashboardKPIs {
  totalInspections: number;
  totalViolations: number;
  pendingReviews: number;
  complianceRate: number;
}

export interface OfflineQueueItem {
  id: string;
  dossier: InspectionDossier;
  queuedAt: string;
  retryCount: number;
  status: 'pending' | 'syncing' | 'synced' | 'error';
}

// ─── Screen State ────────────────────────────────────────────────────────────

export type ScreenId =
  | 'login'
  | 'dashboard'
  | 'new-start'
  | 'camera-hud'
  | 'multi-angle'
  | 'ai-processing'
  | 'extracted-review'
  | 'compliance-gauge'
  | 'violation-cards'
  | 'report-dossier'
  | 'history-table'
  | 'analytics'
  | 'offline-sync'
  | 'regulations'
  | 'side-drawer';

export type CaptureMode = 'camera' | 'upload' | 'manual';

// ─── Processing Steps ────────────────────────────────────────────────────────

export interface ProcessingStep {
  id: number;
  label: string;
  status: 'pending' | 'active' | 'completed';
  progress: number;
}

export const PROCESSING_STEPS: Omit<ProcessingStep, 'status' | 'progress'>[] = [
  { id: 1, label: 'Image Enhancement' },
  { id: 2, label: 'Label Detection' },
  { id: 3, label: 'Text Extraction' },
  { id: 4, label: 'Token Identification' },
  { id: 5, label: 'Compliance Verification' },
];
