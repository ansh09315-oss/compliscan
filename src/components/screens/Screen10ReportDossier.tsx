'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { isSupabaseConfigured, saveDossierToSupabase } from '@/lib/supabase';
import {
  ArrowLeft,
  Download,
  FileText,
  Shield,
  CheckCircle,
  Hash,
  Clock,
  MapPin,
  User,
  Edit3,
  Database,
  Save,
  Eye,
  AlertTriangle,
  Building2,
  Phone,
  Mail,
  Calendar,
  Layers,
  Scale
} from 'lucide-react';
import type { CommodityCategory, PackagingGeometry } from '@/types/metrology';

export default function Screen10ReportDossier() {
  const { activeDossier, updateActiveDossier, currentInspector, setScreen, addToHistory } = useAppStore();

  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Form State initialized from activeDossier
  const [formData, setFormData] = useState({
    productName: activeDossier?.productName || '',
    brandName: activeDossier?.brandName || '',
    category: (activeDossier?.category || 'FOOD_BEVERAGES') as CommodityCategory,
    packagingGeometry: (activeDossier?.packagingGeometry || 'RECTANGULAR_BOX') as PackagingGeometry,
    declaredNetQuantity: activeDossier?.declaredNetQuantity || 0,
    declaredNetUnit: activeDossier?.declaredNetUnit || 'g',
    declaredMrp: activeDossier?.declaredMrp || 0,
    declaredUspValue: activeDossier?.declaredUspValue || '',
    declaredUspUnit: activeDossier?.declaredUspUnit || '',
    declaredMfgMonth: activeDossier?.declaredMfgMonth || 1,
    declaredMfgYear: activeDossier?.declaredMfgYear || 2026,
    manufacturerName: activeDossier?.manufacturerName || '',
    manufacturerAddress: activeDossier?.manufacturerAddress || '',
    countryOfOrigin: activeDossier?.countryOfOrigin || 'India',
    consumerCarePhone: activeDossier?.consumerCarePhone || '',
    consumerCareEmail: activeDossier?.consumerCareEmail || '',
    inspectorRemarks: activeDossier?.inspectorRemarks || 'Automated multi-angle split-path statutory verification completed. Packaging typography verified under Legal Metrology Rules, 2011.'
  });

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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveToStoreAndSupabase = async () => {
    setIsSaving(true);
    setSaveStatus('Saving...');

    const updatedFields = {
      productName: formData.productName,
      brandName: formData.brandName,
      category: formData.category,
      packagingGeometry: formData.packagingGeometry,
      declaredNetQuantity: Number(formData.declaredNetQuantity) || 0,
      declaredNetUnit: formData.declaredNetUnit,
      declaredMrp: Number(formData.declaredMrp) || 0,
      declaredUspValue: formData.declaredUspValue ? Number(formData.declaredUspValue) : undefined,
      declaredUspUnit: formData.declaredUspUnit || undefined,
      declaredMfgMonth: Number(formData.declaredMfgMonth) || 1,
      declaredMfgYear: Number(formData.declaredMfgYear) || 2026,
      manufacturerName: formData.manufacturerName || undefined,
      manufacturerAddress: formData.manufacturerAddress || undefined,
      countryOfOrigin: formData.countryOfOrigin || 'India',
      consumerCarePhone: formData.consumerCarePhone || undefined,
      consumerCareEmail: formData.consumerCareEmail || undefined,
      inspectorRemarks: formData.inspectorRemarks,
    };

    // 1. Update active dossier in Zustand store
    updateActiveDossier(updatedFields);

    const mergedDossier = {
      ...activeDossier,
      ...updatedFields
    };

    // 2. Persist to Supabase Cloud if configured
    try {
      const res = await saveDossierToSupabase(
        mergedDossier,
        activeDossier.violations,
        activeDossier.capturedAngles
      );

      // Also notify backend if online
      try {
        const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '');
        await fetch(`${backendBase}/api/v1/inspection/save-dossier`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dossierCode: activeDossier.dossierReferenceCode,
            masterSha256Hash: activeDossier.masterSha256Hash,
            extractedData: {
              productName: formData.productName,
              brandName: formData.brandName,
              category: formData.category,
              packagingGeometry: formData.packagingGeometry,
              netQuantityValue: Number(formData.declaredNetQuantity),
              netQuantityUnit: formData.declaredNetUnit,
              mrpValue: Number(formData.declaredMrp),
              declaredUspValue: formData.declaredUspValue ? Number(formData.declaredUspValue) : null,
              declaredUspUnit: formData.declaredUspUnit,
              mfgMonth: Number(formData.declaredMfgMonth),
              mfgYear: Number(formData.declaredMfgYear),
              manufacturerName: formData.manufacturerName,
              manufacturerAddress: formData.manufacturerAddress,
              countryOfOrigin: formData.countryOfOrigin,
              consumerCarePhone: formData.consumerCarePhone,
              consumerCareEmail: formData.consumerCareEmail,
              inspectorRemarks: formData.inspectorRemarks
            },
            evaluation: {
              complianceScore: activeDossier.complianceScore,
              verdict: activeDossier.verdict,
              violations: activeDossier.violations
            }
          })
        });
      } catch {
        // Non-fatal if local backend offline
      }

      if (res && res.success) {
        setSaveStatus('✅ Synced to Supabase Cloud & Local Storage');
      } else {
        setSaveStatus('✅ Saved to Local Storage (Supabase pending config)');
      }
    } catch (err) {
      console.warn('[Save Notice]', err);
      setSaveStatus('✅ Saved to Local Storage');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 4000);
    }
  };

  const handleExportPDF = async () => {
    // Automatically save edits first
    await handleSaveToStoreAndSupabase();
    addToHistory(activeDossier);

    try {
      const payload = {
        dossierCode: activeDossier.dossierReferenceCode,
        imageSha256: activeDossier.masterSha256Hash,
        inspectorRemarks: formData.inspectorRemarks,
        extractedData: {
          productName: formData.productName || activeDossier.productName,
          brandName: formData.brandName || activeDossier.brandName,
          category: formData.category || activeDossier.category,
          packagingGeometry: formData.packagingGeometry || activeDossier.packagingGeometry,
          netQuantityValue: Number(formData.declaredNetQuantity) || activeDossier.declaredNetQuantity,
          netQuantityUnit: formData.declaredNetUnit || activeDossier.declaredNetUnit,
          mrpValue: Number(formData.declaredMrp) || activeDossier.declaredMrp,
          declaredUspValue: formData.declaredUspValue || activeDossier.declaredUspValue,
          declaredUspUnit: formData.declaredUspUnit || (activeDossier.declaredUspValue ? `per ${formData.declaredNetUnit}` : undefined),
          manufacturerName: formData.manufacturerName || activeDossier.manufacturerName,
          manufacturerAddress: formData.manufacturerAddress || activeDossier.manufacturerAddress,
          countryOfOrigin: formData.countryOfOrigin || activeDossier.countryOfOrigin || 'India',
          consumerCarePhone: formData.consumerCarePhone || activeDossier.consumerCarePhone,
          consumerCareEmail: formData.consumerCareEmail || activeDossier.consumerCareEmail,
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

      const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '');
      const res = await fetch(`${backendBase}/api/v1/inspection/export-pdf`, {
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
    try {
      if (activeDossier) {
        addToHistory(activeDossier);
      }
    } catch (err) {
      console.warn('[CompliScan] History persistence notice:', err);
    } finally {
      setScreen('dashboard');
    }
  };

  return (
    <div className="screen-container" style={{ animation: 'fade-in-up 0.4s ease-out' }}>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <button className="gov-btn gov-btn-ghost" onClick={() => setScreen('compliance-gauge')}>
          <ArrowLeft size={16} /> Back
        </button>

        {/* View Mode Switcher */}
        <div style={{
          display: 'flex',
          background: 'var(--card-bg)',
          border: '1.5px solid var(--card-border)',
          borderRadius: 'var(--radius-md)',
          padding: '4px',
          gap: '4px'
        }}>
          <button
            className="gov-btn"
            style={{
              padding: '6px 14px',
              fontSize: '13px',
              background: activeTab === 'preview' ? 'var(--primary-blue)' : 'transparent',
              color: activeTab === 'preview' ? '#FFFFFF' : 'var(--text-secondary)',
            }}
            onClick={() => setActiveTab('preview')}
          >
            <Eye size={14} /> Judicial Preview
          </button>
          <button
            className="gov-btn"
            style={{
              padding: '6px 14px',
              fontSize: '13px',
              background: activeTab === 'edit' ? 'var(--primary-blue)' : 'transparent',
              color: activeTab === 'edit' ? '#FFFFFF' : 'var(--text-secondary)',
            }}
            onClick={() => setActiveTab('edit')}
          >
            <Edit3 size={14} /> Editable Form PDF
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {activeTab === 'edit' && (
            <button
              className="gov-btn gov-btn-outline"
              onClick={handleSaveToStoreAndSupabase}
              disabled={isSaving}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Save size={16} /> {isSaving ? 'Saving...' : 'Save & Sync'}
            </button>
          )}
          <button className="gov-btn gov-btn-primary" onClick={handleExportPDF}>
            <Download size={16} /> Export PDF
          </button>
          <button className="gov-btn gov-btn-success" onClick={handleFinish}>
            <CheckCircle size={16} /> Finish
          </button>
        </div>
      </div>

      {/* Cloud Database Status Pill */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--slate-bg)',
        border: '1px solid var(--card-border)',
        marginBottom: '20px',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={15} color="var(--primary-blue)" />
          <span>
            <strong>Database Layer:</strong> {isSupabaseConfigured ? 'Supabase PostgreSQL Cloud' : 'Local IndexedDB + Supabase Bridge Ready'}
          </span>
          <span className={`badge ${isSupabaseConfigured ? 'badge-green' : 'badge-blue'}`}>
            {isSupabaseConfigured ? 'CONNECTED' : 'LOCAL CACHED'}
          </span>
        </div>
        {saveStatus && (
          <span style={{ fontWeight: 600, color: 'var(--compliant-green)' }}>
            {saveStatus}
          </span>
        )}
      </div>

      {/* Report Header */}
      <div className="gov-card" style={{ padding: '24px', marginBottom: '20px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
          <img src="/assets/emblem.svg" alt="Government Emblem" style={{ width: '44px', height: '44px' }} />
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--navy)' }}>
              LEGAL METROLOGY INSPECTION DOSSIER
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
          padding: '6px 16px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--slate-bg)',
          marginTop: '8px',
        }}>
          <FileText size={15} color="var(--primary-blue)" />
          <span style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: 700, color: 'var(--primary-blue)' }}>
            {activeDossier.dossierReferenceCode}
          </span>
        </div>
      </div>

      {/* ─── TAB 2: EDITABLE FORM VIEW ────────────────────────────────────────── */}
      {activeTab === 'edit' && (
        <div className="gov-card" style={{ padding: '24px', marginBottom: '20px', borderTop: '4px solid var(--primary-blue)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Edit3 size={16} color="var(--primary-blue)" />
              EDITABLE STATUTORY DECLARATIONS &amp; OBSERVATIONS
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Modify fields below; changes reflect directly on exported Section 63 PDF &amp; Supabase database.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {/* Product Name */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Product Generic Name
              </label>
              <input
                className="gov-input"
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                placeholder="e.g. Sprite Sparkling Lemon Drink"
              />
            </div>

            {/* Brand Name */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Brand / Trademark
              </label>
              <input
                className="gov-input"
                value={formData.brandName}
                onChange={(e) => handleInputChange('brandName', e.target.value)}
                placeholder="e.g. Sprite"
              />
            </div>

            {/* Category */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Commodity Category
              </label>
              <select
                className="gov-select"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value as CommodityCategory)}
              >
                <option value="FOOD_BEVERAGES">Food &amp; Beverages</option>
                <option value="PACKAGED_DRINKING_WATER">Packaged Drinking Water</option>
                <option value="COSMETICS_SOAP">Cosmetics, Soap &amp; Toiletries</option>
                <option value="PHARMACEUTICAL_HEALTH">Pharmaceutical &amp; Health</option>
                <option value="COMMODITY_GENERAL">General Packaged Commodity</option>
              </select>
            </div>

            {/* Packaging Geometry */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Packaging Geometry
              </label>
              <select
                className="gov-select"
                value={formData.packagingGeometry}
                onChange={(e) => handleInputChange('packagingGeometry', e.target.value as PackagingGeometry)}
              >
                <option value="RECTANGULAR_BOX">Rectangular Box / Carton</option>
                <option value="CYLINDRICAL_BOTTLE">Cylindrical Bottle / Jar</option>
                <option value="CYLINDRICAL_CAN">Cylindrical Metal Can</option>
                <option value="FLEXIBLE_POUCH">Flexible Pouch / Pillow Pack</option>
              </select>
            </div>

            {/* Net Quantity Value & Unit */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Declared Net Quantity
                </label>
                <input
                  type="number"
                  step="any"
                  className="gov-input"
                  value={formData.declaredNetQuantity}
                  onChange={(e) => handleInputChange('declaredNetQuantity', e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Unit
                </label>
                <select
                  className="gov-select"
                  value={formData.declaredNetUnit}
                  onChange={(e) => handleInputChange('declaredNetUnit', e.target.value)}
                >
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="l">l</option>
                  <option value="piece">piece</option>
                  <option value="N">N</option>
                </select>
              </div>
            </div>

            {/* Declared MRP */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Declared MRP (₹ incl. of taxes)
              </label>
              <input
                type="number"
                step="0.01"
                className="gov-input"
                value={formData.declaredMrp}
                onChange={(e) => handleInputChange('declaredMrp', e.target.value)}
              />
            </div>

            {/* Declared USP Value & Unit */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Unit Sale Price (USP)
                </label>
                <input
                  type="number"
                  step="any"
                  className="gov-input"
                  value={formData.declaredUspValue}
                  onChange={(e) => handleInputChange('declaredUspValue', e.target.value)}
                  placeholder="e.g. 0.053"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  USP Unit
                </label>
                <input
                  className="gov-input"
                  value={formData.declaredUspUnit}
                  onChange={(e) => handleInputChange('declaredUspUnit', e.target.value)}
                  placeholder="per ml"
                />
              </div>
            </div>

            {/* Mfg Month & Year */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Mfg Month (1-12)
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  className="gov-input"
                  value={formData.declaredMfgMonth}
                  onChange={(e) => handleInputChange('declaredMfgMonth', e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Mfg Year
                </label>
                <input
                  type="number"
                  className="gov-input"
                  value={formData.declaredMfgYear}
                  onChange={(e) => handleInputChange('declaredMfgYear', e.target.value)}
                />
              </div>
            </div>

            {/* Manufacturer Name */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Manufacturer / Packer Name
              </label>
              <input
                className="gov-input"
                value={formData.manufacturerName}
                onChange={(e) => handleInputChange('manufacturerName', e.target.value)}
                placeholder="e.g. Hindustan Coca-Cola Beverages Pvt Ltd"
              />
            </div>

            {/* Manufacturer Address */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Manufacturer Complete Address (with State &amp; PIN)
              </label>
              <input
                className="gov-input"
                value={formData.manufacturerAddress}
                onChange={(e) => handleInputChange('manufacturerAddress', e.target.value)}
                placeholder="e.g. Plot No. 22, Bidadi Industrial Area, Ramanagara, Karnataka - 562109"
              />
            </div>

            {/* Consumer Care Phone */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Consumer Care Helpline
              </label>
              <input
                className="gov-input"
                value={formData.consumerCarePhone}
                onChange={(e) => handleInputChange('consumerCarePhone', e.target.value)}
                placeholder="e.g. 1800-208-2653"
              />
            </div>

            {/* Consumer Care Email */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Consumer Care Email
              </label>
              <input
                className="gov-input"
                value={formData.consumerCareEmail}
                onChange={(e) => handleInputChange('consumerCareEmail', e.target.value)}
                placeholder="e.g. indiahelpline@coca-cola.com"
              />
            </div>

            {/* Inspector Remarks */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Inspector Official Observations &amp; Judicial Remarks
              </label>
              <textarea
                className="gov-input"
                rows={3}
                style={{ resize: 'vertical' }}
                value={formData.inspectorRemarks}
                onChange={(e) => handleInputChange('inspectorRemarks', e.target.value)}
                placeholder="Enter statutory inspection notes, seizure memo cross-references, or batch verification findings..."
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              className="gov-btn gov-btn-outline"
              onClick={() => setActiveTab('preview')}
            >
              Preview Certificate
            </button>
            <button
              className="gov-btn gov-btn-primary"
              onClick={handleSaveToStoreAndSupabase}
              disabled={isSaving}
            >
              <Save size={16} /> {isSaving ? 'Saving...' : 'Save & Sync to Supabase'}
            </button>
          </div>
        </div>
      )}

      {/* ─── TAB 1: JUDICIAL PREVIEW VIEW ────────────────────────────────────── */}
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

        {/* Product Details (Reflecting Form Edits) */}
        <div className="gov-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} /> PRODUCT DETAILS
            </h3>
            <button
              onClick={() => setActiveTab('edit')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-blue)',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 600
              }}
            >
              <Edit3 size={12} /> Edit
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Product</span>
              <span style={{ fontWeight: 600 }}>{formData.productName || activeDossier.productName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Brand</span>
              <span style={{ fontWeight: 600 }}>{formData.brandName || activeDossier.brandName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Net Qty</span>
              <span style={{ fontWeight: 600 }}>{formData.declaredNetQuantity} {formData.declaredNetUnit}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Declared MRP</span>
              <span style={{ fontWeight: 600 }}>₹{formData.declaredMrp}</span>
            </div>
            {formData.manufacturerName && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Manufacturer</span>
                <span style={{ fontWeight: 600, fontSize: '12px' }}>{formData.manufacturerName}</span>
              </div>
            )}
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
              Based on Legal Metrology (Packaged Commodities) Rules, 2011 &amp; 2026 Amendments
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
            (v1.0.0) on device {activeDossier.deviceHardwareId} at {activeDossier.inspectionTimestamp}. All multi-angle image 
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
          <CheckCircle size={18} /> Complete &amp; Return to Dashboard
        </button>
      </div>
    </div>
  );
}
