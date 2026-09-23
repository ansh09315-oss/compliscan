'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  ScreenId,
  CaptureMode,
  Inspector,
  CapturedAngle,
  ExtractedField,
  ComplianceResult,
  ViolationRecord,
  InspectionDossier,
  OfflineQueueItem,
  ProcessingStep,
  DashboardKPIs,
} from '@/types/metrology';
import { getDeviceHardwareId } from '@/lib/cryptoUtils';
import { saveDossierToSupabase } from '@/lib/supabase';

// Self-healing check: purge legacy oversized base64 store data from localStorage if present
if (typeof window !== 'undefined') {
  try {
    const raw = localStorage.getItem('compliscan-storage');
    if (raw && (raw.includes('data:image') || raw.length > 300000)) {
      console.info('[CompliScan] Detected legacy oversized store data. Sanitizing...');
      localStorage.removeItem('compliscan-storage');
    }
  } catch (e) {
    // ignore
  }
}

// ─── Store Interface ─────────────────────────────────────────────────────────

interface AppState {
  // Navigation
  currentScreen: ScreenId;
  previousScreen: ScreenId | null;
  drawerOpen: boolean;
  setScreen: (screen: ScreenId) => void;
  goBack: () => void;
  toggleDrawer: () => void;

  // Auth
  isAuthenticated: boolean;
  isOfflineMode: boolean;
  currentInspector: Inspector | null;
  login: (inspector: Inspector) => void;
  logout: () => void;
  setOfflineMode: (offline: boolean) => void;

  // Capture
  captureMode: CaptureMode | null;
  capturedAngles: CapturedAngle[];
  setCaptureMode: (mode: CaptureMode) => void;
  addCapturedAngle: (angle: CapturedAngle) => void;
  removeCapturedAngle: (angleType: string) => void;
  clearCaptures: () => void;

  // Processing & Pipeline
  processingSteps: ProcessingStep[];
  isProcessing: boolean;
  setProcessingSteps: (steps: ProcessingStep[]) => void;
  setIsProcessing: (processing: boolean) => void;
  scanProductImage: (fileOrAngleMap: Blob | File | Record<string, Blob | File>) => Promise<{ success: boolean; data?: any; error?: string }>;

  // Extracted Fields
  extractedFields: ExtractedField[];
  setExtractedFields: (fields: ExtractedField[]) => void;
  updateExtractedField: (fieldName: string, value: string) => void;

  // Compliance
  complianceResult: ComplianceResult | null;
  setComplianceResult: (result: ComplianceResult | null) => void;

  // Active Dossier
  activeDossier: InspectionDossier | null;
  setActiveDossier: (dossier: InspectionDossier | null) => void;
  updateActiveDossier: (updates: Partial<InspectionDossier>) => void;

  // History
  inspectionHistory: InspectionDossier[];
  setInspectionHistory: (history: InspectionDossier[]) => void;
  addToHistory: (dossier: InspectionDossier) => void;

  // Dashboard
  dashboardKPIs: DashboardKPIs;
  setDashboardKPIs: (kpis: DashboardKPIs) => void;

  // Offline Queue
  offlineQueue: OfflineQueueItem[];
  addToOfflineQueue: (item: OfflineQueueItem) => void;
  removeFromOfflineQueue: (id: string) => void;
  clearOfflineQueue: () => void;

  // Reset
  resetInspection: () => void;
}

// ─── Default Inspector ───────────────────────────────────────────────────────

const DEFAULT_INSPECTOR: Inspector = {
  id: 'insp-001',
  badgeNumber: '1045',
  fullName: 'Rajesh Kumar Sharma',
  email: 'rk.sharma@legalmetrology.gov.in',
  assignedDistrict: 'Central Delhi',
  stateTerritory: 'Delhi NCT',
  publicKey: 'RSA-2048-GOV-SIMULATED-KEY',
  isActive: true,
  createdAt: new Date().toISOString(),
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Navigation
      currentScreen: 'login',
      previousScreen: null,
      drawerOpen: false,
      setScreen: (screen) =>
        set((state) => ({
          previousScreen: state.currentScreen,
          currentScreen: screen,
          drawerOpen: false,
        })),
      goBack: () =>
        set((state) => ({
          currentScreen: state.previousScreen || 'dashboard',
          previousScreen: null,
        })),
      toggleDrawer: () => set((state) => ({ drawerOpen: !state.drawerOpen })),

      // Auth
      isAuthenticated: false,
      isOfflineMode: false,
      currentInspector: null,
      login: (inspector) =>
        set({
          isAuthenticated: true,
          currentInspector: inspector,
          currentScreen: 'dashboard',
        }),
      logout: () =>
        set({
          isAuthenticated: false,
          currentInspector: null,
          currentScreen: 'login',
          drawerOpen: false,
        }),
      setOfflineMode: (offline) => set({ isOfflineMode: offline }),

      // Capture
      captureMode: null,
      capturedAngles: [],
      setCaptureMode: (mode) => set({ captureMode: mode }),
      addCapturedAngle: (angle) =>
        set((state) => ({
          capturedAngles: [
            ...state.capturedAngles.filter((a) => a.angleType !== angle.angleType),
            angle,
          ],
        })),
      removeCapturedAngle: (angleType) =>
        set((state) => ({
          capturedAngles: state.capturedAngles.filter((a) => a.angleType !== angleType),
        })),
      clearCaptures: () => set({ capturedAngles: [] }),

      // Processing
      processingSteps: [],
      isProcessing: false,
      setProcessingSteps: (steps) => set({ processingSteps: steps }),
      setIsProcessing: (processing) => set({ isProcessing: processing }),

      // Multi-Angle Split-Path OCR & Compliance Scan Dispatcher
      scanProductImage: async (fileOrAngleMap: Blob | File | Record<string, Blob | File>) => {
        try {
          const formData = new FormData();

          if (fileOrAngleMap instanceof Blob || fileOrAngleMap instanceof File) {
            formData.append('files', fileOrAngleMap, 'product_scan.jpg');
            formData.append('file', fileOrAngleMap, 'product_scan.jpg');
          } else if (typeof fileOrAngleMap === 'object' && fileOrAngleMap !== null) {
            const map = fileOrAngleMap as Record<string, Blob | File>;
            if (map['FRONT']) {
              formData.append('front_image', map['FRONT'], 'front.jpg');
              formData.append('files', map['FRONT'], 'front.jpg');
            }
            if (map['BACK']) {
              formData.append('back_image', map['BACK'], 'back.jpg');
              formData.append('files', map['BACK'], 'back.jpg');
            }
            if (map['REGULATORY_SIDE']) {
              formData.append('regulatory_image', map['REGULATORY_SIDE'], 'regulatory.jpg');
              formData.append('files', map['REGULATORY_SIDE'], 'regulatory.jpg');
            }
            if (map['MRP_BATCH']) {
              formData.append('mrp_image', map['MRP_BATCH'], 'mrp.jpg');
              formData.append('files', map['MRP_BATCH'], 'mrp.jpg');
            }

            // If none of standard keys matched, append first key as file
            if (!formData.has('files') && !formData.has('file')) {
              const keys = Object.keys(map);
              if (keys.length > 0 && map[keys[0]]) {
                formData.append('files', map[keys[0]], 'product_scan.jpg');
                formData.append('file', map[keys[0]], 'product_scan.jpg');
              }
            }
          }

          const activeDossier = get().activeDossier;
          if (activeDossier?.packagingGeometry) {
            formData.append('geometry', activeDossier.packagingGeometry);
          }
          if (activeDossier?.containerHeightMm) {
            formData.append('containerHeightMm', String(activeDossier.containerHeightMm));
          }
          if (activeDossier?.containerWidthMm) {
            formData.append('containerWidthMm', String(activeDossier.containerWidthMm));
          }
          if (activeDossier?.circumferenceMm) {
            formData.append('circumferenceMm', String(activeDossier.circumferenceMm));
          }

          let response: Response | null = null;
          let lastError = '';

          // 1. Try primary backend (Codespaces or custom Python server) if configured
          const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || '').trim().replace(/\/+$/, '');
          if (backendBase && backendBase !== 'http://localhost:8000') {
            try {
              console.log(`[CompliScan Engine] Trying primary backend at ${backendBase}/api/v1/inspection/scan...`);
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 12000);
              const primaryRes = await fetch(`${backendBase}/api/v1/inspection/scan`, {
                method: 'POST',
                body: formData,
                signal: controller.signal,
              });
              clearTimeout(timeoutId);
              if (primaryRes.ok) {
                response = primaryRes;
              } else {
                console.warn(`[CompliScan Engine] Primary backend returned status ${primaryRes.status}. Falling back to internal engine...`);
                lastError = `Primary backend returned status ${primaryRes.status}`;
              }
            } catch (err: any) {
              console.warn(`[CompliScan Engine] Primary backend failed (${err.message}). Falling back to internal engine...`);
              lastError = err.message;
            }
          } else if (backendBase === 'http://localhost:8000') {
            try {
              const localRes = await fetch('http://localhost:8000/api/v1/inspection/scan', {
                method: 'POST',
                body: formData,
              });
              if (localRes.ok) {
                response = localRes;
              }
            } catch (err: any) {
              console.warn(`[CompliScan Engine] Local backend unreachable (${err.message}). Falling back to internal engine...`);
            }
          }

          // 2. High-availability fallback: Built-in Next.js Edge/Serverless Inspection Engine
          if (!response) {
            console.log('[CompliScan Engine] Invoking built-in Next.js inspection engine at /api/v1/inspection/scan...');
            const internalRes = await fetch('/api/v1/inspection/scan', {
              method: 'POST',
              body: formData,
            });
            if (internalRes.ok) {
              response = internalRes;
            } else {
              const err = await internalRes.json().catch(() => ({ detail: 'Inspection scanning failed' }));
              throw new Error(err.error || err.detail || `Scan failed (Status ${internalRes.status})`);
            }
          }

          const payload = await response.json();
          const ext = payload.extractedData || {};
          const comp = payload.comprehensiveDetails || ext.comprehensiveDetails || null;
          const evalData = payload.evaluation || {};
          const triCore = payload.triCoreMetadata || {};
          const fieldMeta = triCore.fieldMetadata || {};

          // Helper to get per-field confidence from Master Brain cross-validation
          const fc = (fieldName: string, fallback: number = 0.90) => {
            const meta = fieldMeta[fieldName];
            return meta ? meta.confidence : fallback;
          };

          // Map dynamic extracted declarations with per-field confidence from Master Brain
          const fields: ExtractedField[] = [
            { fieldName: 'productName', displayLabel: 'Product Name', value: ext.productName || comp?.productOverview?.productName || '', confidence: fc('productName'), isEditable: true },
            { fieldName: 'brandName', displayLabel: 'Brand Name', value: ext.brandName || comp?.productOverview?.brandName || (ext.productName || '').split(' ')[0] || '', confidence: fc('productName'), isEditable: true },
            { fieldName: 'category', displayLabel: 'Category', value: ext.category || 'FOOD_BEVERAGES', confidence: fc('category'), isEditable: true },
            { fieldName: 'packagingGeometry', displayLabel: 'Packaging Geometry', value: ext.packagingGeometry || 'RECTANGULAR_BOX', confidence: fc('packagingGeometry'), isEditable: true },
            { fieldName: 'netQuantity', displayLabel: 'Net Quantity', value: String(ext.netQuantityValue || 0), confidence: fc('netQuantityValue'), isEditable: true, unit: ext.netQuantityUnit || 'g' },
            { fieldName: 'mrp', displayLabel: 'MRP (₹)', value: Number(ext.mrpValue || 0).toFixed(2), confidence: fc('mrpValue'), isEditable: true },
            { fieldName: 'uspValue', displayLabel: 'Unit Sale Price', value: ext.declaredUspValue != null ? String(ext.declaredUspValue) : (comp?.pricingAndBatch?.usp || ''), confidence: fc('declaredUspValue'), isEditable: true, unit: ext.declaredUspUnit || '' },
            { fieldName: 'mfgMonth', displayLabel: 'Mfg Month', value: ext.mfgMonth != null ? String(ext.mfgMonth) : '', confidence: fc('mfgMonth'), isEditable: true },
            { fieldName: 'mfgYear', displayLabel: 'Mfg Year', value: ext.mfgYear != null ? String(ext.mfgYear) : '', confidence: fc('mfgYear'), isEditable: true },
            { fieldName: 'manufacturerName', displayLabel: 'Manufacturer', value: ext.manufacturerName || comp?.manufacturerDetails?.companyName || '', confidence: fc('manufacturerName'), isEditable: true },
            { fieldName: 'manufacturerAddress', displayLabel: 'Address', value: ext.manufacturerAddress || comp?.manufacturerDetails?.completeAddress || '', confidence: fc('manufacturerAddress'), isEditable: true },
            { fieldName: 'fssaiLicenseNo', displayLabel: 'FSSAI License #', value: ext.fssaiLicenseNo || comp?.manufacturerDetails?.fssaiLicenseNo || '', confidence: 0.95, isEditable: true },
            { fieldName: 'dietaryClassification', displayLabel: 'Dietary Class', value: ext.dietaryClassification || comp?.productOverview?.dietaryClassification || '', confidence: 0.92, isEditable: true },
            { fieldName: 'ingredientsList', displayLabel: 'Ingredients', value: ext.ingredientsList || comp?.ingredientsAndAllergens?.ingredientsList || '', confidence: 0.90, isEditable: true },
            { fieldName: 'countryOfOrigin', displayLabel: 'Country of Origin', value: ext.countryOfOrigin || 'India', confidence: fc('countryOfOrigin'), isEditable: true },
            { fieldName: 'consumerCarePhone', displayLabel: 'Consumer Care Phone', value: ext.consumerCarePhone || comp?.manufacturerDetails?.customerCarePhone || (comp?.manufacturerDetails as any)?.customerCare || (comp as any)?.customerCarePhone || '', confidence: fc('consumerCarePhone'), isEditable: true },
            { fieldName: 'consumerCareEmail', displayLabel: 'Consumer Care Email', value: ext.consumerCareEmail || comp?.manufacturerDetails?.customerCareEmail || (comp as any)?.customerCareEmail || '', confidence: fc('consumerCareEmail'), isEditable: true },
            { fieldName: 'containerHeight', displayLabel: 'Container Height (mm)', value: String(ext.containerHeightMm || 0), confidence: 0.89, isEditable: true },
            { fieldName: 'containerWidth', displayLabel: 'Container Width (mm)', value: String(ext.containerWidthMm || 0), confidence: 0.85, isEditable: true },
            { fieldName: 'circumference', displayLabel: 'Circumference (mm)', value: String(ext.circumferenceMm || 0), confidence: 0.88, isEditable: true },
            { fieldName: 'fontHeight', displayLabel: 'Detected Font Height (mm)', value: String(ext.detectedNumeralHeightMm || 2.5), confidence: 0.85, isEditable: true },
          ];

          // Map dynamic legal metrology compliance evaluation
          const compliance: ComplianceResult = {
            overallScore: evalData.complianceScore ?? 0,
            verdict: evalData.verdict ?? 'REVIEW_REQUIRED',
            ruleResults: (evalData.ruleResults || []).map((r: any) => ({
              ruleId: r.ruleId,
              ruleLabel: r.ruleLabel,
              passed: Boolean(r.passed),
              details: r.details || '',
              severity: r.severity,
            })),
            violations: (evalData.violations || []).map((v: any) => ({
              statutoryRuleRef: v.statutoryRuleRef || v.statutoryCitation || v.ruleCode,
              severity: v.severity || 'MEDIUM',
              violationTitle: v.violationTitle || v.title || 'Statutory Defect',
              defectDescription: v.defectDescription || v.defect || '',
              detectedValue: v.detectedValue || v.detected || '',
              requiredValue: v.requiredValue || v.expected || '',
            })),
          };

          // Build authentic active dossier
          const dossier: InspectionDossier = {
            dossierReferenceCode: payload.dossierCode || `LM-2026-${payload.imageSha256?.substring(0, 8).toUpperCase()}`,
            inspectorId: get().currentInspector?.id || 'insp-001',
            inspectionTimestamp: new Date().toISOString(),
            productName: ext.productName || comp?.productOverview?.productName || 'Inspected Commodity',
            brandName: ext.brandName || comp?.productOverview?.brandName || (ext.productName || '').split(' ')[0] || 'Brand',
            category: ext.category || 'FOOD_BEVERAGES',
            packagingGeometry: ext.packagingGeometry || 'RECTANGULAR_BOX',
            containerHeightMm: ext.containerHeightMm || 160,
            containerWidthMm: ext.containerWidthMm || undefined,
            circumferenceMm: ext.circumferenceMm || undefined,
            pdpAreaCm2: evalData.pdpAreaCm2 || 0,
            declaredNetQuantity: ext.netQuantityValue || 0,
            declaredNetUnit: ext.netQuantityUnit || 'g',
            declaredMrp: ext.mrpValue || 0,
            declaredUspValue: ext.declaredUspValue || undefined,
            declaredUspUnit: ext.declaredUspUnit || undefined,
            declaredMfgMonth: ext.mfgMonth || 1,
            declaredMfgYear: ext.mfgYear || 2026,
            manufacturerName: ext.manufacturerName || comp?.manufacturerDetails?.companyName || undefined,
            manufacturerAddress: ext.manufacturerAddress || comp?.manufacturerDetails?.completeAddress || undefined,
            countryOfOrigin: ext.countryOfOrigin || 'India',
            consumerCarePhone: ext.consumerCarePhone || comp?.manufacturerDetails?.customerCarePhone || (comp?.manufacturerDetails as any)?.customerCare || (comp as any)?.customerCarePhone || undefined,
            consumerCareEmail: ext.consumerCareEmail || comp?.manufacturerDetails?.customerCareEmail || (comp as any)?.customerCareEmail || undefined,
            detectedFontHeightMm: ext.detectedNumeralHeightMm || 2.5,
            complianceScore: compliance.overallScore,
            verdict: compliance.verdict,
            masterSha256Hash: payload.imageSha256,
            deviceHardwareId: getDeviceHardwareId(),
            isTamperEvident: true,
            isSyncedToCentral: true,
            capturedAngles: get().capturedAngles,
            violations: compliance.violations,
            comprehensiveDetails: comp,
          };

          set({
            extractedFields: fields,
            complianceResult: compliance,
            activeDossier: dossier,
          });

          // Background sync to Supabase cloud if configured
          saveDossierToSupabase(dossier, compliance.violations, get().capturedAngles)
            .catch((err) => console.warn('[Supabase Sync Notice]', err));

          return { success: true, data: payload };
        } catch (error: any) {
          console.error('[CompliScan Store] scanProductImage error:', error);
          return { success: false, error: error.message || 'Scan failed' };
        }
      },

      // Extracted Fields
      extractedFields: [],
      setExtractedFields: (fields) => set({ extractedFields: fields }),
      updateExtractedField: (fieldName, value) =>
        set((state) => ({
          extractedFields: state.extractedFields.map((f) =>
            f.fieldName === fieldName ? { ...f, value } : f
          ),
        })),

      // Compliance
      complianceResult: null,
      setComplianceResult: (result) => set({ complianceResult: result }),

      // Active Dossier
      activeDossier: null,
      setActiveDossier: (dossier) => set({ activeDossier: dossier }),
      updateActiveDossier: (updates) =>
        set((state) => ({
          activeDossier: state.activeDossier
            ? { ...state.activeDossier, ...updates }
            : null,
        })),

      // History
      inspectionHistory: [],
      setInspectionHistory: (history) => set({ inspectionHistory: history }),
      addToHistory: (dossier) =>
        set((state) => {
          if (!dossier) return state;
          // Strip large base64 imageDataUrl from capturedAngles to prevent
          // localStorage QuotaExceededError (each image is ~1-3MB base64).
          const lightDossier = {
            ...dossier,
            capturedAngles: (dossier.capturedAngles || []).map((a) => ({
              ...a,
              imageDataUrl: '', // Strip heavy base64 payload
            })),
          };
          // Cap in-memory history at 25 entries
          const updatedHistory = [lightDossier, ...state.inspectionHistory].slice(0, 25);
          return { inspectionHistory: updatedHistory };
        }),

      // Dashboard
      dashboardKPIs: {
        totalInspections: 0,
        totalViolations: 0,
        pendingReviews: 0,
        complianceRate: 0,
      },
      setDashboardKPIs: (kpis) => set({ dashboardKPIs: kpis }),

      // Offline Queue
      offlineQueue: [],
      addToOfflineQueue: (item) =>
        set((state) => ({
          offlineQueue: [...state.offlineQueue, item],
        })),
      removeFromOfflineQueue: (id) =>
        set((state) => ({
          offlineQueue: state.offlineQueue.filter((q) => q.id !== id),
        })),
      clearOfflineQueue: () => set({ offlineQueue: [] }),

      // Reset
      resetInspection: () =>
        set({
          captureMode: null,
          capturedAngles: [],
          processingSteps: [],
          isProcessing: false,
          extractedFields: [],
          complianceResult: null,
          activeDossier: null,
        }),
    }),
    {
      name: 'compliscan-storage',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return {
          getItem: (key: string) => {
            try {
              return localStorage.getItem(key);
            } catch (e) {
              console.warn('[CompliScan] Failed reading from localStorage:', e);
              return null;
            }
          },
          setItem: (key: string, value: string) => {
            try {
              localStorage.setItem(key, value);
            } catch (err) {
              console.warn('[CompliScan] LocalStorage QuotaExceededError caught — self-healing storage:', err);
              // Cleanly prune and retry
              try {
                const parsed = JSON.parse(value);
                if (parsed?.state?.inspectionHistory) {
                  // Keep only top 3 lightweight summary entries
                  parsed.state.inspectionHistory = (parsed.state.inspectionHistory || []).slice(0, 3).map((item: any) => ({
                    dossierReferenceCode: item.dossierReferenceCode,
                    productName: item.productName,
                    brandName: item.brandName,
                    declaredNetQuantity: item.declaredNetQuantity,
                    declaredNetUnit: item.declaredNetUnit,
                    declaredMrp: item.declaredMrp,
                    verdict: item.verdict,
                    complianceScore: item.complianceScore,
                    inspectionTimestamp: item.inspectionTimestamp,
                  }));
                  localStorage.setItem(key, JSON.stringify(parsed));
                  return;
                }
              } catch {
                // If pruning still fails, safely clear the key so set() NEVER throws
                try {
                  localStorage.removeItem(key);
                } catch {}
              }
            }
          },
          removeItem: (key: string) => {
            try {
              localStorage.removeItem(key);
            } catch {}
          },
        };
      }),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentInspector: state.currentInspector,
        isOfflineMode: state.isOfflineMode,
        // Persist only compact summary fields for history to keep localStorage under 20KB
        inspectionHistory: (state.inspectionHistory || []).slice(0, 15).map((d) => ({
          dossierReferenceCode: d.dossierReferenceCode,
          productName: d.productName,
          brandName: d.brandName,
          category: d.category,
          packagingGeometry: d.packagingGeometry,
          declaredNetQuantity: d.declaredNetQuantity,
          declaredNetUnit: d.declaredNetUnit,
          declaredMrp: d.declaredMrp,
          declaredUspValue: d.declaredUspValue,
          declaredUspUnit: d.declaredUspUnit,
          verdict: d.verdict,
          complianceScore: d.complianceScore,
          criticalViolations: (d as any).criticalViolations ?? (d.violations || []).filter((v: any) => v.severity === 'CRITICAL').length,
          majorViolations: (d as any).majorViolations ?? (d.violations || []).filter((v: any) => v.severity === 'HIGH' || v.severity === 'MAJOR').length,
          minorViolations: (d as any).minorViolations ?? (d.violations || []).filter((v: any) => v.severity === 'MEDIUM' || v.severity === 'LOW').length,
          mandatoryCount: (d as any).mandatoryCount ?? (d.violations || []).length,
          totalChecks: (d as any).totalChecks ?? 12,
          inspectorId: d.inspectorId,
          violations: (d.violations || []).slice(0, 5).map((v: any) => ({
            id: v.id,
            ruleName: v.ruleName,
            severity: v.severity,
            description: v.description,
          })),
        })),
        offlineQueue: state.offlineQueue,
        dashboardKPIs: state.dashboardKPIs,
      }),
    }
  )
);

export { DEFAULT_INSPECTOR };
