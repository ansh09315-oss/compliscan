'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { ChevronRight, ArrowLeft, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function Screen08ComplianceGauge() {
  const { complianceResult, setScreen } = useAppStore();
  const [animatedScore, setAnimatedScore] = useState(0);

  const score = complianceResult?.overallScore || 0;
  const verdict = complianceResult?.verdict || 'REVIEW_REQUIRED';
  const rules = complianceResult?.ruleResults || [];

  useEffect(() => {
    let frame: number;
    let current = 0;
    const animate = () => {
      current += (score - current) * 0.08;
      if (Math.abs(current - score) < 0.5) {
        setAnimatedScore(score);
        return;
      }
      setAnimatedScore(Math.round(current));
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const verdictConfig: Record<string, { color: string; bg: string; label: string }> = {
    COMPLIANT: { color: 'var(--compliant-green)', bg: 'var(--compliant-green-bg)', label: 'COMPLIANT' },
    PARTIALLY_COMPLIANT: { color: '#B45309', bg: 'var(--amber-warning-bg)', label: 'PARTIALLY COMPLIANT' },
    NON_COMPLIANT: { color: 'var(--violation-red)', bg: 'var(--violation-red-bg)', label: 'NON-COMPLIANT' },
    REVIEW_REQUIRED: { color: 'var(--primary-blue)', bg: '#DBEAFE', label: 'REVIEW REQUIRED' },
  };

  const vc = verdictConfig[verdict] || verdictConfig.REVIEW_REQUIRED;

  // Semi-circular gauge
  const radius = 100;
  const circumference = Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="screen-container" style={{ animation: 'fade-in-up 0.4s ease-out' }}>
      <button className="gov-btn gov-btn-ghost" onClick={() => setScreen('extracted-review')} style={{ marginBottom: '16px' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px', textAlign: 'center' }}>
        Compliance Result
      </h1>

      {/* Gauge */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ position: 'relative', width: '240px', height: '140px', margin: '0 auto' }}>
          <svg width="240" height="140" viewBox="0 0 240 140">
            {/* Background arc */}
            <path
              d="M 20 130 A 100 100 0 0 1 220 130"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Score arc */}
            <path
              d="M 20 130 A 100 100 0 0 1 220 130"
              fill="none"
              stroke={vc.color}
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', fontWeight: 800, color: vc.color, lineHeight: 1 }}>
              {animatedScore}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>out of 100</div>
          </div>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 20px',
          borderRadius: '9999px',
          background: vc.bg,
          marginTop: '16px',
        }}>
          {verdict === 'COMPLIANT' ? <CheckCircle size={18} color={vc.color} /> : <AlertTriangle size={18} color={vc.color} />}
          <span style={{ fontSize: '14px', fontWeight: 700, color: vc.color, letterSpacing: '0.05em' }}>
            {vc.label}
          </span>
        </div>
      </div>

      {/* Rule Checklist */}
      <div className="gov-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Statutory Rules Checklist</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {rules.map((rule) => (
            <div
              key={rule.ruleId}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                background: rule.passed ? 'rgba(22, 163, 74, 0.04)' : 'rgba(220, 38, 38, 0.04)',
                border: `1px solid ${rule.passed ? 'rgba(22, 163, 74, 0.15)' : 'rgba(220, 38, 38, 0.15)'}`,
              }}
            >
              {rule.passed ? (
                <CheckCircle size={20} color="var(--compliant-green)" style={{ flexShrink: 0, marginTop: '1px' }} />
              ) : (
                <XCircle size={20} color="var(--violation-red)" style={{ flexShrink: 0, marginTop: '1px' }} />
              )}
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {rule.ruleLabel}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {rule.details}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        {complianceResult && complianceResult.violations.length > 0 && (
          <button className="gov-btn gov-btn-danger" onClick={() => setScreen('violation-cards')}>
            View Violations ({complianceResult.violations.length}) <ChevronRight size={16} />
          </button>
        )}
        <button className="gov-btn gov-btn-primary" onClick={() => setScreen('report-dossier')}>
          View Report <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
