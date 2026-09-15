'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import type { ProcessingStep } from '@/types/metrology';
import { Loader2, CheckCircle, Circle, Cpu } from 'lucide-react';

const STEP_LABELS = [
  'Image Enhancement',
  'Label Detection',
  'Text Extraction',
  'Token Identification',
  'Compliance Verification',
];

export default function Screen06AIProcessing() {
  const { setScreen, setProcessingSteps, setIsProcessing, setExtractedFields } = useAppStore();
  const [steps, setLocalSteps] = useState<ProcessingStep[]>(
    STEP_LABELS.map((label, i) => ({ id: i + 1, label, status: 'pending', progress: 0 }))
  );
  const [overallProgress, setOverallProgress] = useState(0);

  const generateMockExtractedFields = useCallback(() => {
    setExtractedFields([
      { fieldName: 'productName', displayLabel: 'Product Name', value: 'Parle-G Gold Biscuits', confidence: 0.95, isEditable: true },
      { fieldName: 'brandName', displayLabel: 'Brand Name', value: 'Parle', confidence: 0.98, isEditable: true },
      { fieldName: 'netQuantity', displayLabel: 'Net Quantity', value: '500', confidence: 0.92, isEditable: true, unit: 'g' },
      { fieldName: 'mrp', displayLabel: 'MRP (₹)', value: '40.00', confidence: 0.96, isEditable: true },
      { fieldName: 'uspValue', displayLabel: 'Unit Sale Price', value: '0.08', confidence: 0.88, isEditable: true, unit: '₹ per g' },
      { fieldName: 'mfgMonth', displayLabel: 'Mfg Month', value: '8', confidence: 0.90, isEditable: true },
      { fieldName: 'mfgYear', displayLabel: 'Mfg Year', value: '2026', confidence: 0.94, isEditable: true },
      { fieldName: 'manufacturerName', displayLabel: 'Manufacturer', value: 'Parle Products Pvt. Ltd.', confidence: 0.97, isEditable: true },
      { fieldName: 'manufacturerAddress', displayLabel: 'Address', value: 'Vile Parle East, Mumbai, Maharashtra 400057', confidence: 0.85, isEditable: true },
      { fieldName: 'countryOfOrigin', displayLabel: 'Country of Origin', value: 'India', confidence: 0.99, isEditable: true },
      { fieldName: 'consumerCarePhone', displayLabel: 'Consumer Care Phone', value: '18001031045', confidence: 0.91, isEditable: true },
      { fieldName: 'consumerCareEmail', displayLabel: 'Consumer Care Email', value: 'consumer@parle.com', confidence: 0.89, isEditable: true },
      { fieldName: 'containerHeight', displayLabel: 'Container Height (mm)', value: '200', confidence: 0.87, isEditable: true },
      { fieldName: 'containerWidth', displayLabel: 'Container Width (mm)', value: '140', confidence: 0.86, isEditable: true },
      { fieldName: 'fontHeight', displayLabel: 'Detected Font Height (mm)', value: '2.8', confidence: 0.82, isEditable: true },
    ]);
  }, [setExtractedFields]);

  useEffect(() => {
    setIsProcessing(true);
    let currentStep = 0;
    let progress = 0;

    const interval = setInterval(() => {
      progress += Math.random() * 8 + 3;

      if (progress >= 100) {
        progress = 100;
        setLocalSteps((prev) => {
          const updated = [...prev];
          updated[currentStep] = { ...updated[currentStep], status: 'completed', progress: 100 };
          if (currentStep + 1 < updated.length) {
            updated[currentStep + 1] = { ...updated[currentStep + 1], status: 'active', progress: 0 };
          }
          return updated;
        });

        currentStep++;
        progress = 0;

        if (currentStep >= STEP_LABELS.length) {
          clearInterval(interval);
          setOverallProgress(100);
          setIsProcessing(false);
          generateMockExtractedFields();

          setTimeout(() => {
            setScreen('extracted-review');
          }, 1000);
          return;
        }
      }

      setLocalSteps((prev) => {
        const updated = [...prev];
        if (currentStep < updated.length) {
          updated[currentStep] = { ...updated[currentStep], status: 'active', progress };
        }
        return updated;
      });

      const completedSteps = currentStep;
      setOverallProgress(Math.round(((completedSteps * 100 + progress) / (STEP_LABELS.length * 100)) * 100));
    }, 200);

    return () => clearInterval(interval);
  }, [setScreen, setIsProcessing, setProcessingSteps, generateMockExtractedFields]);

  useEffect(() => {
    setProcessingSteps(steps);
  }, [steps, setProcessingSteps]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0B2545 0%, #13315C 100%)',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '520px', animation: 'fade-in-up 0.5s ease-out' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '72px',
            height: '72px',
            margin: '0 auto 16px',
            borderRadius: '50%',
            background: 'rgba(29, 78, 216, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Cpu size={36} color="#60A5FA" className={overallProgress < 100 ? 'animate-spin-slow' : ''} />
          </div>
          <h1 style={{ color: '#FFFFFF', fontSize: '22px', fontWeight: 700 }}>
            {overallProgress < 100 ? 'Analyzing Product Label...' : 'Analysis Complete!'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginTop: '4px' }}>
            AI-powered compliance verification pipeline
          </p>
        </div>

        {/* Overall Progress */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '13px',
            fontWeight: 600,
          }}>
            <span>Overall Progress</span>
            <span>{overallProgress}%</span>
          </div>
          <div style={{
            height: '8px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${overallProgress}%`,
              height: '100%',
              background: overallProgress >= 100
                ? 'var(--compliant-green)'
                : 'linear-gradient(90deg, #3B82F6, #60A5FA)',
              borderRadius: '4px',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* Steps */}
        <div className="gov-card" style={{ padding: '24px' }}>
          {steps.map((step, i) => (
            <div
              key={step.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '14px 0',
                borderBottom: i < steps.length - 1 ? '1px solid var(--card-border)' : 'none',
              }}
            >
              <div style={{ flexShrink: 0 }}>
                {step.status === 'completed' ? (
                  <CheckCircle size={24} color="var(--compliant-green)" />
                ) : step.status === 'active' ? (
                  <Loader2 size={24} color="var(--primary-blue)" className="animate-spin-slow" />
                ) : (
                  <Circle size={24} color="var(--text-muted)" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: step.status === 'pending' ? 'var(--text-muted)' : 'var(--text-primary)',
                }}>
                  {step.label}
                </div>
                {step.status === 'active' && (
                  <div style={{ marginTop: '6px' }}>
                    <div style={{
                      height: '4px',
                      background: '#E5E7EB',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${step.progress}%`,
                        height: '100%',
                        background: 'var(--primary-blue)',
                        borderRadius: '2px',
                        transition: 'width 0.2s',
                      }} />
                    </div>
                  </div>
                )}
              </div>
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                color: step.status === 'completed' ? 'var(--compliant-green)' : step.status === 'active' ? 'var(--primary-blue)' : 'var(--text-muted)',
              }}>
                {step.status === 'completed' ? '100%' : step.status === 'active' ? `${Math.round(step.progress)}%` : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
