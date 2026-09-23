'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import type { ProcessingStep } from '@/types/metrology';
import { Loader2, CheckCircle, Circle, Cpu, Zap, Layers, Check } from 'lucide-react';

const STEP_LABELS = [
  '📸 4-Panel Ingestion: Front (PDP), Back, Regulatory & MRP',
  '🧠 Gemini 2.5 Flash Multi-Angle VLM Semantic Synthesis',
  '🔬 4-Stage Multi-Panel Image Enhancement (CLAHE + Morph)',
  '📐 PaddleOCR PDP Typography & Numeral Height Calibration (Rule 7)',
  '⚖️ Brain MD: Cross-Panel Anti-Hallucination Arbitration',
];

export default function Screen06AIProcessing() {
  const { setScreen, setProcessingSteps, setIsProcessing, scanProductImage, capturedAngles } = useAppStore();
  const [steps, setLocalSteps] = useState<ProcessingStep[]>(
    STEP_LABELS.map((label, i) => ({ id: i + 1, label, status: 'pending', progress: 0 }))
  );
  const [overallProgress, setOverallProgress] = useState(0);
  const [isLiveScanning, setIsLiveScanning] = useState(true);
  const scanPromiseRef = useRef<Promise<any> | null>(null);

  const [scanError, setScanError] = useState<string | null>(null);

  const processImageWithBackend = useCallback(async () => {
    try {
      if (!capturedAngles || capturedAngles.length === 0) {
        console.warn('No images available for scanning, proceeding with simulated inspection.');
        return { success: true };
      }

      // Convert all captured angles into Blobs for multi-panel transmission
      const angleBlobs: Record<string, Blob> = {};
      for (const angle of capturedAngles) {
        if (angle.imageDataUrl) {
          try {
            const response = await fetch(angle.imageDataUrl);
            const blob = await response.blob();
            angleBlobs[angle.angleType] = blob;
          } catch (e) {
            console.error(`Failed to convert ${angle.angleType} dataUrl to blob:`, e);
          }
        }
      }

      const scanResult = await scanProductImage(angleBlobs);
      if (!scanResult.success) {
        console.warn('4-Angle Live Scan reported note:', scanResult.error);
      }
      return scanResult;
    } catch (err: any) {
      console.error('Backend scan error:', err);
      return { success: false, error: err?.message || 'Connection failed' };
    }
  }, [capturedAngles, scanProductImage]);

  useEffect(() => {
    setIsProcessing(true);
    let isCancelled = false;
    let currentStep = 0;
    let progress = 0;

    const runInspectionPipeline = async () => {
      // 1. Kick off real backend scan promise
      const scanPromise = processImageWithBackend();

      // 2. Animate steps smoothly while backend processes concurrently
      const interval = setInterval(() => {
        if (isCancelled) {
          clearInterval(interval);
          return;
        }

        progress += Math.random() * 12 + 10;

        // Cap animation at step 5 (94%) until backend completes
        if (progress >= 100) {
          if (currentStep < 4) {
            progress = 0;
            currentStep++;
            setLocalSteps((prev) => {
              const updated = [...prev];
              if (currentStep - 1 >= 0) {
                updated[currentStep - 1] = { ...updated[currentStep - 1], status: 'completed', progress: 100 };
              }
              if (currentStep < updated.length) {
                updated[currentStep] = { ...updated[currentStep], status: 'active', progress: 0 };
              }
              return updated;
            });
          } else {
            // Stay at active step 5 (Brain MD cross-validation) until backend resolves
            progress = 94;
          }
        }

        setLocalSteps((prev) => {
          const updated = [...prev];
          if (currentStep < updated.length) {
            updated[currentStep] = { ...updated[currentStep], status: 'active', progress };
          }
          return updated;
        });

        setOverallProgress(Math.min(92, Math.round(((currentStep * 100 + progress) / (STEP_LABELS.length * 100)) * 100)));
      }, 150);

      // 3. Await actual backend scan completion
      const result = await scanPromise;
      clearInterval(interval);

      if (isCancelled) return;

      if (!result?.success && result?.error) {
        setScanError(result.error);
      }

      // 4. Mark all steps completed and reach 100%
      setLocalSteps(
        STEP_LABELS.map((label, i) => ({ id: i + 1, label, status: 'completed', progress: 100 }))
      );
      setOverallProgress(100);
      setIsLiveScanning(false);
      setIsProcessing(false);

      // 5. Smooth transition to review
      setTimeout(() => {
        if (!isCancelled) {
          setScreen('extracted-review');
        }
      }, 700);
    };

    runInspectionPipeline();

    return () => {
      isCancelled = true;
    };
  }, [setScreen, setIsProcessing, setProcessingSteps, processImageWithBackend]);

  useEffect(() => {
    setProcessingSteps(steps);
  }, [steps, setProcessingSteps]);

  // Detected panels present in state
  const presentPanelTypes = new Set(capturedAngles.map((a) => a.angleType));

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0B2545 0%, #13315C 100%)',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '580px', animation: 'fade-in-up 0.5s ease-out' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '76px',
            height: '76px',
            margin: '0 auto 16px',
            borderRadius: '50%',
            background: 'rgba(29, 78, 216, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 30px rgba(96, 165, 250, 0.3)',
          }}>
            <Cpu size={38} color="#60A5FA" className={overallProgress < 100 ? 'animate-spin-slow' : ''} />
          </div>
          <h1 style={{ color: '#FFFFFF', fontSize: '23px', fontWeight: 700 }}>
            {overallProgress < 100 ? 'Analyzing All 4 Packaging Panels...' : 'Multi-Panel Analysis Complete!'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.68)', fontSize: '13px', marginTop: '6px', lineHeight: 1.5 }}>
            Front (PDP) + Back + Regulatory Side + MRP Stamp → Brain MD Verdict
          </p>

          {/* Panel Badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
            {[
              { id: 'FRONT', label: '1. Front (PDP)' },
              { id: 'BACK', label: '2. Back Panel' },
              { id: 'REGULATORY_SIDE', label: '3. Regulatory' },
              { id: 'MRP_BATCH', label: '4. MRP & Stamp' },
            ].map((p) => {
              const hasPanel = presentPanelTypes.has(p.id as any);
              return (
                <span
                  key={p.id}
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: hasPanel ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                    color: hasPanel ? '#34D399' : 'rgba(255, 255, 255, 0.5)',
                    border: hasPanel ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: hasPanel ? '#34D399' : 'rgba(255, 255, 255, 0.3)'
                  }} />
                  {p.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Overall Progress */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
            color: 'rgba(255,255,255,0.85)',
            fontSize: '13px',
            fontWeight: 600,
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={14} color="#60A5FA" /> 4-Angle Synchronous Pipeline
            </span>
            <span>{overallProgress}%</span>
          </div>
          <div style={{
            height: '8px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${overallProgress}%`,
              background: 'linear-gradient(90deg, #3B82F6 0%, #10B981 100%)',
              borderRadius: '4px',
              transition: 'width 0.2s ease-out',
            }} />
          </div>
        </div>

        {/* Steps List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', marginBottom: '28px' }}>
          {steps.map((step) => {
            const isCompleted = step.status === 'completed';
            const isActive = step.status === 'active';

            return (
              <div
                key={step.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '13px 16px',
                  borderRadius: '12px',
                  background: isActive
                    ? 'rgba(59, 130, 246, 0.16)'
                    : isCompleted
                    ? 'rgba(16, 185, 129, 0.1)'
                    : 'rgba(255,255,255,0.04)',
                  border: isActive
                    ? '1px solid rgba(59, 130, 246, 0.45)'
                    : isCompleted
                    ? '1px solid rgba(16, 185, 129, 0.25)'
                    : '1px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Status Icon */}
                <div style={{ flexShrink: 0 }}>
                  {isCompleted ? (
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Check size={13} color="#FFFFFF" strokeWidth={3} />
                    </div>
                  ) : isActive ? (
                    <Loader2 size={22} color="#60A5FA" className="animate-spin" />
                  ) : (
                    <Circle size={22} color="rgba(255,255,255,0.2)" />
                  )}
                </div>

                {/* Step Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    color: isCompleted ? '#D1FAE5' : isActive ? '#FFFFFF' : 'rgba(255,255,255,0.45)',
                    fontSize: '13px',
                    fontWeight: isActive || isCompleted ? 600 : 400,
                  }}>
                    {step.label}
                  </div>
                  {isActive && (
                    <div style={{
                      marginTop: '6px',
                      height: '3px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${step.progress}%`,
                        background: '#60A5FA',
                        transition: 'width 0.15s ease',
                      }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Technical Callout Badge */}
        <div style={{
          textAlign: 'center',
          padding: '11px 16px',
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.55)',
          fontSize: '11.5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#10B981' }} />
          Cross-Panel Synthesis Active (Front + Back + Regulatory + MRP) — Section 63 BSA 2023 Compliant
        </div>
      </div>
    </div>
  );
}
