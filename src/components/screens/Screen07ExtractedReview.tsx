'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { evaluateCompliance, calculatePDPArea } from '@/lib/complianceEngine';
import { computeMasterHash, generateDossierCode, getDeviceHardwareId } from '@/lib/cryptoUtils';
import {
  ArrowLeft,
  ChevronRight,
  Edit3,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Tag,
  Scale,
  Sparkles,
  Award,
  AlertTriangle,
  Building2,
  Phone,
  Mail,
  Calendar,
  Layers
} from 'lucide-react';
import { PackagingGeometry, CommodityCategory } from '@/types/metrology';

export default function Screen07ExtractedReview() {
  const {
    extractedFields,
    updateExtractedField,
    setScreen,
    capturedAngles,
    setComplianceResult,
    setActiveDossier,
    activeDossier,
    currentInspector,
  } = useAppStore();

  const [editingField, setEditingField] = useState<string | null>(null);

  // If no fields, show manual entry form
  const [manualMode] = useState(extractedFields.length === 0);
  const [manualFields, setManualFields] = useState({
    productName: activeDossier?.productName || 'Millet Muesli',
    brandName: activeDossier?.brandName || 'Yoga Bar',
    netQuantity: String(activeDossier?.declaredNetQuantity || '450'),
    netUnit: activeDossier?.declaredNetUnit || 'g',
    mrp: String(activeDossier?.declaredMrp || '285.00'),
    uspValue: String(activeDossier?.declaredUspValue || '0.63'),
    mfgMonth: String(activeDossier?.declaredMfgMonth || '1'),
    mfgYear: String(activeDossier?.declaredMfgYear || '2026'),
    manufacturerName: activeDossier?.manufacturerName || 'Sproutlife Foods Pvt. Ltd.',
    manufacturerAddress: activeDossier?.manufacturerAddress || 'Plot No. 6 and 7, India Food Park, Vasanthanarasapura Industrial Area, KIADB Phase 3, Kora Hobli, Tumkur, Karnataka-572138',
    fssaiLicenseNo: activeDossier?.comprehensiveDetails?.manufacturerDetails?.fssaiLicenseNo || '11222999000656',
    countryOfOrigin: activeDossier?.countryOfOrigin || 'India',
    consumerCarePhone: activeDossier?.consumerCarePhone || '+91 96060 30616',
    consumerCareEmail: activeDossier?.consumerCareEmail || 'hello@yogabars.in',
    containerHeight: String(activeDossier?.containerHeightMm || '200'),
    containerWidth: String(activeDossier?.containerWidthMm || '140'),
    fontHeight: String(activeDossier?.detectedFontHeightMm || '2.8'),
    category: activeDossier?.category || 'FOOD_BEVERAGES',
    geometry: activeDossier?.packagingGeometry || 'RECTANGULAR_BOX',
  });

  const comp = activeDossier?.comprehensiveDetails;
  const overview = comp?.productOverview;
  const pricing = comp?.pricingAndBatch;
  const nutrition = comp?.nutritionalInfoPer100g;
  const ingredients = comp?.ingredientsAndAllergens;
  const manufacturer = comp?.manufacturerDetails;

  const getFieldValue = (name: string) => {
    if (manualMode) return manualFields[name as keyof typeof manualFields] || '';
    const fieldVal = extractedFields.find((f) => f.fieldName === name)?.value;
    if (fieldVal !== undefined && fieldVal !== '') return fieldVal;
    // Fallback to activeDossier & comprehensive details
    if (name === 'consumerCarePhone') return activeDossier?.consumerCarePhone || manufacturer?.customerCarePhone || (manufacturer as any)?.customerCare || manualFields.consumerCarePhone || '';
    if (name === 'consumerCareEmail') return activeDossier?.consumerCareEmail || manufacturer?.customerCareEmail || manualFields.consumerCareEmail || '';
    if (name === 'manufacturerName') return activeDossier?.manufacturerName || manufacturer?.companyName || manualFields.manufacturerName || '';
    if (name === 'manufacturerAddress') return activeDossier?.manufacturerAddress || manufacturer?.completeAddress || manualFields.manufacturerAddress || '';
    if (name === 'fssaiLicenseNo') return manufacturer?.fssaiLicenseNo || manualFields.fssaiLicenseNo || '';
    return '';
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
    return extractedFields.find((f) => f.fieldName === name)?.confidence || 0.9;
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
    const netUnit = manualMode ? manualFields.netUnit : (extractedFields.find(f => f.fieldName === 'netQuantity')?.unit || 'g');
    const uspUnit = manualMode ? manualFields.netUnit : (extractedFields.find(f => f.fieldName === 'uspValue')?.unit || (netUnit === 'ml' ? 'per ml' : 'per g'));
    const category = (manualMode ? manualFields.category : (extractedFields.find(f => f.fieldName === 'category')?.value || 'FOOD_BEVERAGES')) as CommodityCategory;

    const resolvedPhone = getFieldValue('consumerCarePhone') || manufacturer?.customerCarePhone || activeDossier?.consumerCarePhone || undefined;
    const resolvedEmail = getFieldValue('consumerCareEmail') || manufacturer?.customerCareEmail || activeDossier?.consumerCareEmail || undefined;

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
      manufacturerName: getFieldValue('manufacturerName') || manufacturer?.companyName || undefined,
      manufacturerAddress: getFieldValue('manufacturerAddress') || manufacturer?.completeAddress || undefined,
      consumerCarePhone: resolvedPhone,
      consumerCareEmail: resolvedEmail,
      declaredMfgMonth: parseInt(getFieldValue('mfgMonth')) || 8,
      declaredMfgYear: parseInt(getFieldValue('mfgYear')) || 2026,
      countryOfOrigin: getFieldValue('countryOfOrigin') || 'India',
    });

    setComplianceResult(result);

    const imageHashes = capturedAngles.map((a) => a.sha256Hash);
    const masterHash = imageHashes.length > 0
      ? await computeMasterHash(imageHashes)
      : await computeMasterHash(['compliscan-multi-angle-scan']);

    const dossier = {
      dossierReferenceCode: generateDossierCode(),
      inspectorId: currentInspector?.id || 'insp-001',
      inspectionTimestamp: new Date().toISOString(),
      productName: getFieldValue('productName') || overview?.productName || 'Inspected Commodity',
      brandName: getFieldValue('brandName') || overview?.brandName || 'Brand',
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
      declaredUspUnit: uspUnit,
      declaredMfgMonth: parseInt(getFieldValue('mfgMonth')) || 8,
      declaredMfgYear: parseInt(getFieldValue('mfgYear')) || 2026,
      manufacturerName: getFieldValue('manufacturerName') || manufacturer?.companyName || undefined,
      manufacturerAddress: getFieldValue('manufacturerAddress') || manufacturer?.completeAddress || undefined,
      countryOfOrigin: getFieldValue('countryOfOrigin') || 'India',
      consumerCarePhone: getFieldValue('consumerCarePhone') || manufacturer?.customerCarePhone || undefined,
      consumerCareEmail: getFieldValue('consumerCareEmail') || manufacturer?.customerCareEmail || undefined,
      detectedFontHeightMm: parseFloat(getFieldValue('fontHeight')) || 2.5,
      complianceScore: result.overallScore,
      verdict: result.verdict,
      masterSha256Hash: masterHash,
      deviceHardwareId: getDeviceHardwareId(),
      isTamperEvident: true,
      isSyncedToCentral: true,
      capturedAngles,
      violations: result.violations,
      comprehensiveDetails: comp,
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
        { name: 'fssaiLicenseNo', label: 'FSSAI License No.' },
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

      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px', color: 'var(--navy)' }}>
            {manualMode ? 'Enter Statutory Details' : 'Multi-Image Contextual Verification'}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {manualMode
              ? 'Enter packaged commodity declarations for legal metrology verification.'
              : 'Stitched across Front, Back, Regulatory & MRP panels using Split-Path Gemini VLM + OCR.'}
          </p>
        </div>

        {/* Dietary Classification Pill */}
        {overview?.dietaryClassification && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '9999px',
            background: overview.dietaryClassification.toLowerCase().includes('veg') && !overview.dietaryClassification.toLowerCase().includes('non')
              ? 'rgba(22, 163, 74, 0.1)'
              : 'rgba(220, 38, 38, 0.1)',
            border: `1.5px solid ${overview.dietaryClassification.toLowerCase().includes('veg') && !overview.dietaryClassification.toLowerCase().includes('non') ? '#16A34A' : '#DC2626'}`,
            fontSize: '13px',
            fontWeight: 700,
            color: overview.dietaryClassification.toLowerCase().includes('veg') && !overview.dietaryClassification.toLowerCase().includes('non') ? '#16A34A' : '#DC2626'
          }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: overview.dietaryClassification.toLowerCase().includes('veg') && !overview.dietaryClassification.toLowerCase().includes('non') ? '#16A34A' : '#DC2626'
            }} />
            {overview.dietaryClassification}
          </div>
        )}
      </div>

      {/* ─── RICH MULTI-IMAGE CARDS (If VLM Contextual Details Present) ───────── */}
      {comp && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          
          {/* Card 1: Product Overview & Key Claims */}
          <div className="gov-card" style={{ padding: '18px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={15} color="var(--primary-blue)" />
              PRODUCT OVERVIEW &amp; CLAIMS
            </h3>
            <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div><strong>Brand:</strong> {overview?.brandName || '—'}</div>
              <div><strong>Product:</strong> {overview?.productName || '—'}</div>
              {overview?.variant && <div><strong>Variant:</strong> {overview.variant}</div>}
              {overview?.keyClaims && overview.keyClaims.length > 0 && (
                <div style={{ marginTop: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Key Claims:</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {overview.keyClaims.map((claim, idx) => (
                      <span key={idx} style={{
                        padding: '2px 8px',
                        background: 'rgba(29, 78, 216, 0.08)',
                        color: 'var(--primary-blue)',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 600
                      }}>
                        {claim}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Pricing, Net Weight & Batch */}
          <div className="gov-card" style={{ padding: '18px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Tag size={15} color="var(--primary-blue)" />
              PRICING &amp; BATCH DETAILS
            </h3>
            <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div><strong>Net Weight:</strong> {pricing?.netWeight || `${getFieldValue('netQuantity')} ${getFieldValue('netUnit')}`}</div>
              <div><strong>MRP:</strong> ₹ {pricing?.mrp != null ? pricing.mrp : getFieldValue('mrp')}</div>
              <div><strong>Declared USP:</strong> {pricing?.usp || getFieldValue('uspValue') || '—'}</div>
              <div><strong>Mfg / Use-By:</strong> {pricing?.mfgDate || '—'} / {pricing?.useByDate || '—'}</div>
              {pricing?.lotOrBatchNo && <div><strong>Batch / Lot:</strong> <code style={{ fontSize: '11px' }}>{pricing.lotOrBatchNo}</code></div>}
              {pricing?.barcode && <div><strong>Barcode:</strong> <code style={{ fontSize: '11px' }}>{pricing.barcode}</code></div>}
            </div>
          </div>

          {/* Card 3: FSSAI & Manufacturer Details */}
          <div className="gov-card" style={{ padding: '18px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={15} color="var(--compliant-green)" />
              FSSAI &amp; MANUFACTURER
            </h3>
            <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>
                <strong>FSSAI License:</strong>{' '}
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: manufacturer?.fssaiLicenseNo ? 'var(--navy)' : 'var(--violation-red)' }}>
                  {manufacturer?.fssaiLicenseNo || getFieldValue('fssaiLicenseNo') || 'NOT DECLARED'}
                </span>
              </div>
              <div><strong>Packer / Maker:</strong> {manufacturer?.companyName || getFieldValue('manufacturerName') || '—'}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                <strong>Address:</strong> {manufacturer?.completeAddress || getFieldValue('manufacturerAddress') || '—'}
              </div>
              {(manufacturer?.customerCarePhone || manufacturer?.customerCareEmail) && (
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Care: {manufacturer.customerCarePhone || '—'} | {manufacturer.customerCareEmail || '—'}
                </div>
              )}
            </div>
          </div>

          {/* Card 4: Nutrition Table per 100g */}
          {nutrition && (
            <div className="gov-card" style={{ padding: '18px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Scale size={15} color="var(--primary-blue)" />
                NUTRITIONAL FACTS (PER 100G)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px' }}>
                <div>Energy: <strong>{nutrition.energyKcal != null ? `${nutrition.energyKcal} kcal` : '—'}</strong></div>
                <div>Protein: <strong>{nutrition.proteinG != null ? `${nutrition.proteinG} g` : '—'}</strong></div>
                <div>Total Carbs: <strong>{nutrition.totalCarbohydrateG != null ? `${nutrition.totalCarbohydrateG} g` : '—'}</strong></div>
                <div>Total Sugar: <strong>{nutrition.totalSugarG != null ? `${nutrition.totalSugarG} g` : '—'}</strong></div>
                <div>Added Sugar: <strong>{nutrition.addedSugarG != null ? `${nutrition.addedSugarG} g` : '—'}</strong></div>
                <div>Total Fat: <strong>{nutrition.totalFatG != null ? `${nutrition.totalFatG} g` : '—'}</strong></div>
              </div>
            </div>
          )}

          {/* Card 5: Ingredients & Allergen Warning */}
          {ingredients && (ingredients.ingredientsList || ingredients.allergenAdvice) && (
            <div className="gov-card" style={{ padding: '18px', gridColumn: 'span 2' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={15} color="#D97706" />
                INGREDIENTS &amp; ALLERGEN ADVICE
              </h3>
              {ingredients.ingredientsList && (
                <p style={{ fontSize: '12px', lineHeight: 1.5, marginBottom: '6px', color: 'var(--text-primary)' }}>
                  <strong>Ingredients:</strong> {ingredients.ingredientsList}
                </p>
              )}
              {ingredients.allergenAdvice && (
                <div style={{
                  padding: '6px 10px',
                  background: 'rgba(217, 119, 6, 0.08)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11px',
                  color: '#92400E',
                  fontWeight: 600
                }}>
                  ⚠️ Allergen Alert: {ingredients.allergenAdvice} {ingredients.manufacturingWarning ? `(${ingredients.manufacturingWarning})` : ''}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── STATUTORY VERIFICATION & GROUNDING TABLE ──────────────────────── */}
      <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy)', marginBottom: '12px' }}>
        Legal Metrology Declarations &amp; Grounding Confidence
      </h2>

      <div className="gov-card" style={{ overflow: 'hidden', marginBottom: '24px' }}>
        <table className="gov-table">
          <thead>
            <tr>
              <th style={{ width: '35%' }}>Statutory Field</th>
              <th style={{ width: '45%' }}>Verified Declaration</th>
              {!manualMode && <th style={{ width: '20%' }}>OCR Grounding</th>}
            </tr>
          </thead>
          <tbody>
            {fieldRows.map((row) => {
              const conf = getConfidence(row.name);
              const val = getFieldValue(row.name);
              return (
                <tr key={row.name}>
                  <td style={{ fontWeight: 600, fontSize: '13px' }}>{row.label}</td>
                  <td>
                    {editingField === row.name || manualMode ? (
                      <input
                        className="gov-input"
                        value={val}
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
                        <span style={{ fontSize: '13px', fontWeight: val ? 500 : 400 }}>{val || '—'}</span>
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

      <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '32px' }}>
        <button
          className="gov-btn gov-btn-primary"
          style={{ padding: '14px 36px', fontSize: '16px' }}
          onClick={handleProceed}
        >
          Proceed to Compliance Check <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
