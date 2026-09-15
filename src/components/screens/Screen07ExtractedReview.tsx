'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { evaluateCompliance, calculatePDPArea } from '@/lib/complianceEngine';
import { computeMasterHash, generateDossierCode, getDeviceHardwareId } from '@/lib/cryptoUtils';
import { ArrowLeft, ChevronRight, Edit3, CheckCircle, AlertCircle } from 'lucide-react';
import { PackagingGeometry, CommodityCategory, VerdictStatus } from '@/types/metrology';

export default function Screen07ExtractedReview() {
  const {
    extractedFields, updateExtractedField, setScreen, capturedAngles,
    setComplianceResult, setActiveDossier, currentInspector,
  } = useAppStore();
  const [editingField, setEditingField] = useState<string | null>(null);

  // If no fields, show manual entry form
  const [manualMode] = useState(extractedFields.length === 0);
  const [manualFields, setManualFields] = useState({
    productName: '', brandName: '', netQuantity: '500', netUnit: 'g',
    mrp: '40', uspValue: '0.08', mfgMonth: '8', mfgYear: '2026',
    manufacturerName: '', manufacturerAddress: '',
    countryOfOrigin: 'India', consumerCarePhone: '', consumerCareEmail: '',
    containerHeight: '200', containerWidth: '140', fontHeight: '2.8',
    category: 'FOOD_BEVERAGES', geometry: 'RECTANGULAR_BOX',
  });

  const getFieldValue = (name: string) => {
    if (manualMode) return manualFields[name as keyof typeof manualFields] || '';
    return extractedFields.find((f) => f.fieldName === name)?.value || '';
  };

  const setFieldValue = (name: string, value: string) => {
    if (manualMode) {
      setManualFields((prev) => ({ ...prev, [name]: value }));
    } else {
      updateExtractedField(name, value);
    }
  };

  const getConfidence = (name: string) => {
    if (manualMode) return 1.0;
    return extractedFields.find((f) => f.fieldName === name)?.confidence || 0;
  };

  const handleProceed = async () => {
    const heightMm = parseFloat(getFieldValue('containerHeight')) || 220;
    const widthMm = parseFloat(getFieldValue('containerWidth')) || 0;
    const circumferenceMm = parseFloat(getFieldValue('circumference')) || (getFieldValue('containerWidth') ? undefined : 190);
    const geometry = (manualMode 
      ? manualFields.geometry 
      : (extractedFields.find(f => f.fieldName === 'packagingGeometry')?.value || (circumferenceMm ? 'CYLINDRICAL_CONTAINER' : 'RECTANGULAR_BOX'))
    ) as PackagingGeometry;
    const pdpArea = calculatePDPArea(geometry, heightMm, widthMm > 0 ? widthMm : undefined, circumferenceMm);
    const netUnit = manualMode ? manualFields.netUnit : (extractedFields.find(f => f.fieldName === 'netQuantity')?.unit || 'ml');
    const uspUnit = manualMode ? manualFields.netUnit : (extractedFields.find(f => f.fieldName === 'uspValue')?.unit || (netUnit === 'ml' ? 'per ml' : 'per g'));
    const category = (manualMode ? manualFields.category : (extractedFields.find(f => f.fieldName === 'category')?.value || 'FOOD_BEVERAGES')) as CommodityCategory;

    const result = evaluateCompliance({
      packagingGeometry: geometry,
      containerHeightMm: heightMm,
      containerWidthMm: widthMm > 0 ? widthMm : undefined,
      circumferenceMm: circumferenceMm,
      declaredNetQuantity: parseFloat(getFieldValue('netQuantity')) || 0,
      declaredNetUnit: netUnit,
      declaredMrp: parseFloat(getFieldValue('mrp')) || 0,
      declaredUspValue: parseFloat(getFieldValue('uspValue')) || undefined,
      declaredUspUnit: uspUnit,
      detectedFontHeightMm: parseFloat(getFieldValue('fontHeight')) || 2.5,
      manufacturerName: getFieldValue('manufacturerName'),
      manufacturerAddress: getFieldValue('manufacturerAddress'),
      consumerCarePhone: getFieldValue('consumerCarePhone'),
      consumerCareEmail: getFieldValue('consumerCareEmail'),
      declaredMfgMonth: parseInt(getFieldValue('mfgMonth')) || 8,
      declaredMfgYear: parseInt(getFieldValue('mfgYear')) || 2026,
      countryOfOrigin: getFieldValue('countryOfOrigin') || 'India',
    });

    setComplianceResult(result);

    const imageHashes = capturedAngles.map((a) => a.sha256Hash);
    const masterHash = imageHashes.length > 0
      ? await computeMasterHash(imageHashes)
      : await computeMasterHash(['compliscan-dynamic-scan']);

    const dossier = {
      dossierReferenceCode: generateDossierCode(),
      inspectorId: currentInspector?.id || 'insp-001',
      inspectionTimestamp: new Date().toISOString(),
      productName: getFieldValue('productName') || 'Inspected Commodity',
      brandName: getFieldValue('brandName') || getFieldValue('productName') || 'Brand',
      category: category,
      packagingGeometry: geometry,
      containerHeightMm: heightMm,
      containerWidthMm: widthMm > 0 ? widthMm : undefined,
      circumferenceMm: circumferenceMm,
      pdpAreaCm2: pdpArea,
      declaredNetQuantity: parseFloat(getFieldValue('netQuantity')) || 0,
      declaredNetUnit: netUnit,
      declaredMrp: parseFloat(getFieldValue('mrp')) || 0,
      declaredUspValue: parseFloat(getFieldValue('uspValue')) || undefined,
      declaredMfgMonth: parseInt(getFieldValue('mfgMonth')) || 8,
      declaredMfgYear: parseInt(getFieldValue('mfgYear')) || 2026,
      manufacturerName: getFieldValue('manufacturerName') || undefined,
      manufacturerAddress: getFieldValue('manufacturerAddress') || undefined,
      countryOfOrigin: getFieldValue('countryOfOrigin') || undefined,
      consumerCarePhone: getFieldValue('consumerCarePhone') || undefined,
      consumerCareEmail: getFieldValue('consumerCareEmail') || undefined,
      detectedFontHeightMm: parseFloat(getFieldValue('fontHeight')) || 0,
      complianceScore: result.overallScore,
      verdict: result.verdict,
      masterSha256Hash: masterHash,
      deviceHardwareId: getDeviceHardwareId(),
      isTamperEvident: true,
      isSyncedToCentral: true,
      capturedAngles,
      violations: result.violations,
    };

    setActiveDossier(dossier);
    setScreen('compliance-gauge');
  };

  const fieldRows = manualMode
    ? [
        { name: 'productName', label: 'Product Name' },
        { name: 'brandName', label: 'Brand Name' },
        { name: 'netQuantity', label: 'Net Quantity' },
        { name: 'mrp', label: 'MRP (₹)' },
        { name: 'uspValue', label: 'Unit Sale Price (₹)' },
        { name: 'mfgMonth', label: 'Mfg Month (1-12)' },
        { name: 'mfgYear', label: 'Mfg Year' },
        { name: 'manufacturerName', label: 'Manufacturer Name' },
        { name: 'manufacturerAddress', label: 'Manufacturer Address' },
        { name: 'countryOfOrigin', label: 'Country of Origin' },
        { name: 'consumerCarePhone', label: 'Consumer Care Phone' },
        { name: 'consumerCareEmail', label: 'Consumer Care Email' },
        { name: 'containerHeight', label: 'Container Height (mm)' },
        { name: 'containerWidth', label: 'Container Width (mm)' },
        { name: 'fontHeight', label: 'Font Height (mm)' },
      ]
    : extractedFields.map((f) => ({ name: f.fieldName, label: f.displayLabel }));

  return (
    <div className="screen-container" style={{ animation: 'fade-in-up 0.4s ease-out' }}>
      <button className="gov-btn gov-btn-ghost" onClick={() => setScreen('multi-angle')} style={{ marginBottom: '16px' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>
        {manualMode ? 'Enter Product Details' : 'Review Extracted Information'}
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
        {manualMode
          ? 'Enter the declaration details from the packaging for compliance evaluation'
          : 'Verify and edit AI-extracted data before compliance evaluation'}
      </p>

      {manualMode && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Category</label>
            <select className="gov-select" value={manualFields.category} onChange={(e) => setManualFields(p => ({ ...p, category: e.target.value }))}>
              <option value="FOOD_BEVERAGES">Food & Beverages</option>
              <option value="PERSONAL_CARE_COSMETICS">Personal Care</option>
              <option value="HOUSEHOLD_CHEMICALS">Household</option>
              <option value="PHARMACEUTICALS">Pharmaceuticals</option>
              <option value="ELECTRONICS_HARDWARE">Electronics</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Packaging</label>
            <select className="gov-select" value={manualFields.geometry} onChange={(e) => setManualFields(p => ({ ...p, geometry: e.target.value }))}>
              <option value="RECTANGULAR_BOX">Rectangular Box</option>
              <option value="CYLINDRICAL_CONTAINER">Cylindrical</option>
              <option value="FLEXIBLE_POUCH">Flexible Pouch</option>
              <option value="IRREGULAR_SHAPE">Irregular</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Net Qty Unit</label>
            <select className="gov-select" value={manualFields.netUnit} onChange={(e) => setManualFields(p => ({ ...p, netUnit: e.target.value }))}>
              <option value="g">Grams (g)</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="ml">Milliliters (ml)</option>
              <option value="l">Liters (l)</option>
              <option value="piece">Pieces</option>
            </select>
          </div>
        </div>
      )}

      <div className="gov-card" style={{ overflow: 'hidden' }}>
        <table className="gov-table">
          <thead>
            <tr>
              <th style={{ width: '35%' }}>Field</th>
              <th style={{ width: '45%' }}>Value</th>
              {!manualMode && <th style={{ width: '20%' }}>Confidence</th>}
            </tr>
          </thead>
          <tbody>
            {fieldRows.map((row) => {
              const conf = getConfidence(row.name);
              return (
                <tr key={row.name}>
                  <td style={{ fontWeight: 600, fontSize: '13px' }}>{row.label}</td>
                  <td>
                    {editingField === row.name || manualMode ? (
                      <input
                        className="gov-input"
                        value={getFieldValue(row.name)}
                        onChange={(e) => setFieldValue(row.name, e.target.value)}
                        onBlur={() => setEditingField(null)}
                        autoFocus={editingField === row.name}
                        style={{ padding: '6px 10px', fontSize: '13px' }}
                      />
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          transition: 'background 0.15s',
                        }}
                        onClick={() => setEditingField(row.name)}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--slate-bg)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <span style={{ fontSize: '13px' }}>{getFieldValue(row.name) || '—'}</span>
                        <Edit3 size={12} color="var(--text-muted)" />
                      </div>
                    )}
                  </td>
                  {!manualMode && (
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {conf >= 0.9 ? (
                          <CheckCircle size={14} color="var(--compliant-green)" />
                        ) : (
                          <AlertCircle size={14} color={conf >= 0.7 ? 'var(--amber-warning)' : 'var(--violation-red)'} />
                        )}
                        <div style={{
                          width: '60px',
                          height: '6px',
                          background: '#E5E7EB',
                          borderRadius: '3px',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${conf * 100}%`,
                            height: '100%',
                            background: conf >= 0.9 ? 'var(--compliant-green)' : conf >= 0.7 ? 'var(--amber-warning)' : 'var(--violation-red)',
                            borderRadius: '3px',
                          }} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {Math.round(conf * 100)}%
                        </span>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <button className="gov-btn gov-btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }} onClick={handleProceed}>
          Run Compliance Check <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
