'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { ArrowLeft, ChevronRight, AlertTriangle, AlertOctagon, Info } from 'lucide-react';

export default function Screen09ViolationCards() {
  const { complianceResult, setScreen } = useAppStore();
  const violations = complianceResult?.violations || [];

  const severityConfig: Record<string, { icon: React.ElementType; color: string; bg: string; border: string }> = {
    CRITICAL: { icon: AlertOctagon, color: 'var(--violation-red)', bg: 'var(--violation-red-bg)', border: '#FCA5A5' },
    HIGH: { icon: AlertTriangle, color: '#EA580C', bg: '#FFF7ED', border: '#FDBA74' },
    MEDIUM: { icon: AlertTriangle, color: '#B45309', bg: 'var(--amber-warning-bg)', border: '#FCD34D' },
    LOW: { icon: Info, color: 'var(--primary-blue)', bg: '#DBEAFE', border: '#93C5FD' },
  };

  return (
    <div className="screen-container" style={{ animation: 'fade-in-up 0.4s ease-out' }}>
      <button className="gov-btn gov-btn-ghost" onClick={() => setScreen('compliance-gauge')} style={{ marginBottom: '16px' }}>
        <ArrowLeft size={16} /> Back to Results
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Violation Details</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {violations.length} violation{violations.length !== 1 ? 's' : ''} detected during compliance evaluation
          </p>
        </div>
        <div style={{
          padding: '8px 16px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--violation-red-bg)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <AlertTriangle size={18} color="var(--violation-red)" />
          <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--violation-red)' }}>{violations.length}</span>
        </div>
      </div>

      {/* Violation Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        {violations.map((v, i) => {
          const sc = severityConfig[v.severity] || severityConfig.MEDIUM;
          const Icon = sc.icon;
          return (
            <div
              key={i}
              className="gov-card"
              style={{
                padding: '20px',
                borderLeft: `4px solid ${sc.color}`,
                animation: `fade-in-up 0.4s ease-out ${i * 0.1}s both`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    background: sc.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={20} color={sc.color} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {v.violationTitle}
                    </h3>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      background: sc.bg,
                      color: sc.color,
                      border: `1px solid ${sc.border}`,
                    }}>
                      {v.severity}
                    </span>
                  </div>
                </div>
                <span style={{
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--slate-bg)',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                }}>
                  {v.statutoryRuleRef}
                </span>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
                {v.defectDescription}
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--slate-bg)',
              }}>
                {v.detectedValue && (
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase', fontWeight: 600 }}>
                      Detected
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--violation-red)' }}>
                      {v.detectedValue}
                    </div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase', fontWeight: 600 }}>
                    Required
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--compliant-green)' }}>
                    {v.requiredValue}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {violations.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '48px',
          color: 'var(--text-muted)',
        }}>
          <Info size={48} style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '16px', fontWeight: 600 }}>No violations detected</p>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>All statutory rules have been satisfied</p>
        </div>
      )}

      <div style={{ textAlign: 'center' }}>
        <button className="gov-btn gov-btn-primary" onClick={() => setScreen('report-dossier')} style={{ padding: '14px 32px' }}>
          View Full Report <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
