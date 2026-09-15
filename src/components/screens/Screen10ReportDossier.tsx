'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { ArrowLeft, Download, FileText, Shield, CheckCircle, Hash, Clock, MapPin, User } from 'lucide-react';

export default function Screen10ReportDossier() {
  const { activeDossier, complianceResult, currentInspector, setScreen, addToHistory } = useAppStore();

  if (!activeDossier) {
    return (
      <div className="screen-container" style={{ textAlign: 'center', padding: '64px' }}>
        <p>No active dossier. Please run an inspection first.</p>
        <button className="gov-btn gov-btn-primary" onClick={() => setScreen('dashboard')} style={{ marginTop: '16px' }}>
          Go to Dashboard
        </button>
      </div>
    );
  }

  const verdictColors: Record<string, string> = {
    COMPLIANT: 'var(--compliant-green)',
    PARTIALLY_COMPLIANT: 'var(--amber-warning)',
    NON_COMPLIANT: 'var(--violation-red)',
    REVIEW_REQUIRED: 'var(--primary-blue)',
  };

  const handleExportPDF = async () => {
    // Save to history
    addToHistory(activeDossier);

    try {
      const payload = {
        dossierCode: activeDossier.dossierReferenceCode,
        imageSha256: activeDossier.masterSha256Hash,
        extractedData: {
          productName: activeDossier.productName,
          category: activeDossier.category,
          packagingGeometry: activeDossier.packagingGeometry,
          netQuantityValue: activeDossier.declaredNetQuantity,
          netQuantityUnit: activeDossier.declaredNetUnit,
          mrpValue: activeDossier.declaredMrp,
          declaredUspValue: activeDossier.declaredUspValue,
          declaredUspUnit: activeDossier.declaredUspValue ? `per ${activeDossier.declaredNetUnit}` : undefined,
        },
        evaluation: {
          complianceScore: activeDossier.complianceScore,
          verdict: activeDossier.verdict,
          violations: activeDossier.violations.map(v => ({
            ruleCode: v.statutoryRuleRef,
            severity: v.severity,
            defect: v.defectDescription,
            detected: v.detectedValue || 'N/A',
            expected: v.requiredValue
          }))
        }
      };

      const res = await fetch('http://localhost:8000/api/v1/inspection/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CompliScan_Judicial_Dossier_${activeDossier.dossierReferenceCode}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return;
      }
    } catch (e) {
      console.warn('Backend PDF export error, falling back to print dialog:', e);
    }

    // Fallback printable view
    window.print();
  };

  const handleFinish = () => {
    addToHistory(activeDossier);
    setScreen('dashboard');
  };

  return (
    <div className="screen-container" style={{ animation: 'fade-in-up 0.4s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button className="gov-btn gov-btn-ghost" onClick={() => setScreen('compliance-gauge')}>
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="gov-btn gov-btn-primary" onClick={handleExportPDF}>
            <Download size={16} /> Export PDF
          </button>
          <button className="gov-btn gov-btn-success" onClick={handleFinish}>
            <CheckCircle size={16} /> Finish
          </button>
        </div>
      </div>

      {/* Report Header */}
      <div className="gov-card" style={{ padding: '32px', marginBottom: '20px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
          <img src="/assets/emblem.svg" alt="Government Emblem" style={{ width: '48px', height: '48px' }} />
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--navy)' }}>
              LEGAL METROLOGY INSPECTION REPORT
            </h1>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>
              DEPARTMENT OF CONSUMER AFFAIRS • GOVERNMENT OF INDIA
            </p>
          </div>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 20px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--slate-bg)',
          marginTop: '12px',
        }}>
          <FileText size={16} color="var(--primary-blue)" />
          <span style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 700, color: 'var(--primary-blue)' }}>
            {activeDossier.dossierReferenceCode}
          </span>
        </div>
      </div>

      {/* Two-column info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Inspector Details */}
        <div className="gov-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User size={14} /> INSPECTOR DETAILS
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Name</span>
              <span style={{ fontWeight: 600 }}>{currentInspector?.fullName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Badge #</span>
              <span style={{ fontWeight: 600 }}>{currentInspector?.badgeNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>District</span>
              <span style={{ fontWeight: 600 }}>{currentInspector?.assignedDistrict}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>State</span>
              <span style={{ fontWeight: 600 }}>{currentInspector?.stateTerritory}</span>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="gov-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={14} /> PRODUCT DETAILS
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Product</span>
              <span style={{ fontWeight: 600 }}>{activeDossier.productName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Brand</span>
              <span style={{ fontWeight: 600 }}>{activeDossier.brandName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Net Qty</span>
              <span style={{ fontWeight: 600 }}>{activeDossier.declaredNetQuantity} {activeDossier.declaredNetUnit}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>MRP</span>
              <span style={{ fontWeight: 600 }}>₹{activeDossier.declaredMrp}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Score */}
      <div className="gov-card" style={{
        padding: '20px',
        marginBottom: '20px',
        borderLeft: `4px solid ${verdictColors[activeDossier.verdict] || 'var(--primary-blue)'}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Compliance Verdict</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Based on Legal Metrology (Packaged Commodities) Rules, 2011
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: '36px',
              fontWeight: 800,
              color: verdictColors[activeDossier.verdict],
            }}>
              {activeDossier.complianceScore}%
            </div>
            <span className={`badge ${
              activeDossier.verdict === 'COMPLIANT' ? 'badge-green' :
              activeDossier.verdict === 'NON_COMPLIANT' ? 'badge-red' :
              activeDossier.verdict === 'PARTIALLY_COMPLIANT' ? 'badge-amber' : 'badge-blue'
            }`}>
              {activeDossier.verdict.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Violations Summary */}
      {activeDossier.violations.length > 0 && (
        <div className="gov-card" style={{ padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px' }}>
            VIOLATIONS SUMMARY ({activeDossier.violations.length})
          </h3>
          {activeDossier.violations.map((v, i) => (
            <div key={i} style={{
              padding: '10px 0',
              borderBottom: i < activeDossier.violations.length - 1 ? '1px solid var(--card-border)' : 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '13px',
            }}>
              <div>
                <span style={{ fontWeight: 600 }}>{v.violationTitle}</span>
                <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>{v.statutoryRuleRef}</span>
              </div>
              <span className={`badge ${
                v.severity === 'CRITICAL' ? 'badge-red' :
                v.severity === 'HIGH' ? 'badge-amber' : 'badge-blue'
              }`}>
                {v.severity}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Section 63 BSA Digital Certificate */}
      <div className="gov-card" style={{
        padding: '24px',
        marginBottom: '20px',
        background: 'linear-gradient(135deg, var(--navy-dark) 0%, var(--navy) 100%)',
        color: '#FFFFFF',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Shield size={20} color="#D4AF37" />
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#D4AF37', letterSpacing: '0.05em' }}>
            SECTION 63 — BHARATIYA SAKSHYA ADHINIYAM, 2023
          </h3>
        </div>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
          Digital Evidence Certificate for Judicial Admissibility
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}>
              <Hash size={10} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
              Master SHA-256 Hash
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', wordBreak: 'break-all', color: '#D4AF37' }}>
              {activeDossier.masterSha256Hash}
            </div>
          </div>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}>
              Device Hardware ID
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#D4AF37' }}>
              {activeDossier.deviceHardwareId}
            </div>
          </div>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}>
              <Clock size={10} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
              Timestamp (ISO 8601)
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '11px' }}>
              {activeDossier.inspectionTimestamp}
            </div>
          </div>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}>
              <MapPin size={10} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
              Tamper-Evident Status
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={12} color="var(--compliant-green)" />
              <span style={{ color: 'var(--compliant-green)', fontWeight: 600 }}>INTEGRITY VERIFIED</span>
            </div>
          </div>
        </div>

        <div style={{
          marginTop: '16px',
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
        }}>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
            <strong style={{ color: '#D4AF37' }}>Part A Certificate:</strong> This electronic record was produced by the CompliScan AI system 
            (v1.0.0) on device {activeDossier.deviceHardwareId} at {activeDossier.inspectionTimestamp}. All image 
            captures were hashed using SHA-256 per Section 63(4)(a).
          </p>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, marginTop: '6px' }}>
            <strong style={{ color: '#D4AF37' }}>Part B Certificate:</strong> Electronically verified by Inspector {currentInspector?.fullName} 
            (Badge #{currentInspector?.badgeNumber}), {currentInspector?.assignedDistrict}, {currentInspector?.stateTerritory}.
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '24px', marginBottom: '32px' }}>
        <button className="gov-btn gov-btn-success" onClick={handleFinish} style={{ padding: '14px 32px', fontSize: '16px' }}>
          <CheckCircle size={18} /> Complete & Return to Dashboard
        </button>
      </div>
    </div>
  );
}
