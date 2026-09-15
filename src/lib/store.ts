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

  // Processing
  processingSteps: ProcessingStep[];
  isProcessing: boolean;
  setProcessingSteps: (steps: ProcessingStep[]) => void;
  setIsProcessing: (processing: boolean) => void;

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
    (set) => ({
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

      // History
      inspectionHistory: [],
      setInspectionHistory: (history) => set({ inspectionHistory: history }),
      addToHistory: (dossier) =>
        set((state) => ({
          inspectionHistory: [dossier, ...state.inspectionHistory],
        })),

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
        if (typeof window !== 'undefined') return localStorage;
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentInspector: state.currentInspector,
        isOfflineMode: state.isOfflineMode,
        inspectionHistory: state.inspectionHistory,
        offlineQueue: state.offlineQueue,
        dashboardKPIs: state.dashboardKPIs,
      }),
    }
  )
);

export { DEFAULT_INSPECTOR };
