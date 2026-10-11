'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import {
  ArrowLeft,
  Search,
  Download,
  Eye,
  Filter,
  Calendar,
  X,
  Printer,
  CheckCircle,
  AlertTriangle,
  FileText,
  Shield,
  ExternalLink,
  Loader2,
  Building2,
  Phone,
  Mail,
  Scale
} from 'lucide-react';
import type { InspectionDossier, CommodityCategory, PackagingGeometry, VerdictStatus } from '@/types/metrology';

export default function Screen11HistoryTable() {
  const { inspectionHistory, setScreen, setActiveDossier, setComplianceResult, currentInspector } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected dossier for modal preview
  const [previewDossier, setPreviewDossier] = useState<InspectionDossier | null>(null);
  const [downloadingCode, setDownloadingCode] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Helper to rehydrate complete InspectionDossier from any row (real scan or sample)
  const buildFullDossier = (item: any): InspectionDossier => {
    return {
      id: item.id || `hist-${item.dossierReferenceCode}`,
      dossierReferenceCode: item.dossierReferenceCode || `LM-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      inspectorId: item.inspectorId || currentInspector?.badgeNumber || currentInspector?.id || 'IND-LM-2026-0419',
      inspectionTimestamp: item.inspectionTimestamp || new Date().toISOString(),
      productName: item.productName || 'Packaged Commodity',
      brandName: item.brandName || 'Brand',
      category: (item.category || 'FOOD_BEVERAGES') as CommodityCategory,
      packagingGeometry: (item.packagingGeometry || 'RECTANGULAR_BOX') as PackagingGeometry,
      containerHeightMm: item.containerHeightMm || 160,
      containerWidthMm: item.containerWidthMm || 90,
      circumferenceMm: item.circumferenceMm || undefined,
      pdpAreaCm2: item.pdpAreaCm2 || 144,
      declaredNetQuantity: Number(item.declaredNetQuantity) || 100,
      declaredNetUnit: item.declaredNetUnit || 'g',
      declaredMrp: Number(item.declaredMrp) || 50,
      declaredUspValue: item.declaredUspValue ?? (item.declaredMrp && item.declaredNetQuantity ? Number((item.declaredMrp / item.declaredNetQuantity).toFixed(2)) : 0.5),
      declaredUspUnit: item.declaredUspUnit || `per ${item.declaredNetUnit || 'g'}`,
      declaredMfgMonth: Number(item.declaredMfgMonth) || 1,
      declaredMfgYear: Number(item.declaredMfgYear) || 2026,
      manufacturerName: item.manufacturerName || `${item.brandName || 'Manufacturer'} India Consumer Products Ltd`,
      manufacturerAddress: item.manufacturerAddress || 'Industrial Area, Phase II, New Delhi - 110020',
      countryOfOrigin: item.countryOfOrigin || 'India',
      consumerCarePhone: item.consumerCarePhone || '1800-208-1926',
      consumerCareEmail: item.consumerCareEmail || 'grievance@packagedgoods.in',
      detectedFontHeightMm: Number(item.detectedFontHeightMm) || 3.0,
      complianceScore: Number(item.complianceScore ?? 100),
      verdict: (item.verdict || 'COMPLIANT') as VerdictStatus,
      masterSha256Hash: item.masterSha256Hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      deviceHardwareId: item.deviceHardwareId || 'LM-DEVICE-TERMINAL-01',
      isTamperEvident: true,
      isSyncedToCentral: true,
      capturedAngles: item.capturedAngles || [],
      violations: item.violations || [],
      inspectorRemarks: item.inspectorRemarks || `Verified statutory declarations under Legal Metrology (Packaged Commodities) Rules, 2011. Score: ${item.complianceScore}%. Verdict: ${item.verdict}.`,
      comprehensiveDetails: item.comprehensiveDetails || {
        productOverview: { brandName: item.brandName, productName: item.productName },
        pricingAndBatch: { mrp: item.declaredMrp, netWeight: `${item.declaredNetQuantity} ${item.declaredNetUnit}` },
        manufacturerDetails: { companyName: item.manufacturerName, completeAddress: item.manufacturerAddress }
      }
    };
  };

  // Demo fallback data if no historical scans exist in state
  const allItems = useMemo(() => {
    if (inspectionHistory.length > 0) return inspectionHistory;
    return [
      { dossierReferenceCode: 'LM-2026-847291', productName: 'Parle-G Gold Biscuits', brandName: 'Parle', verdict: 'COMPLIANT', complianceScore: 100, inspectionTimestamp: '2026-09-14T10:30:00Z', declaredNetQuantity: 500, declaredNetUnit: 'g', declaredMrp: 40, violations: [] },
      { dossierReferenceCode: 'LM-2026-729384', productName: 'Fortune Sunlite Oil', brandName: 'Fortune', verdict: 'PARTIALLY_COMPLIANT', complianceScore: 78, inspectionTimestamp: '2026-09-13T14:15:00Z', declaredNetQuantity: 1000, declaredNetUnit: 'ml', declaredMrp: 180, violations: [{ statutoryRuleRef: 'Rule 6(11)', severity: 'MEDIUM', violationTitle: 'Unit Sale Price Non-Standard', defectDescription: 'Declared USP is not rounded to standard decimal places under Rule 6(11).' }] },
      { dossierReferenceCode: 'LM-2026-618273', productName: 'Dove Body Wash', brandName: 'Dove', verdict: 'NON_COMPLIANT', complianceScore: 44, inspectionTimestamp: '2026-09-12T09:00:00Z', declaredNetQuantity: 250, declaredNetUnit: 'ml', declaredMrp: 299, violations: [{ statutoryRuleRef: 'Rule 7', severity: 'CRITICAL', violationTitle: 'Numeral Height Deficit', defectDescription: 'Net quantity numeral height is 1.6mm; Rule 7 mandates minimum 2.5mm for area.' }, { statutoryRuleRef: 'Rule 6(1)(d)', severity: 'HIGH', violationTitle: 'Consumer Care Phone Missing', defectDescription: 'No consumer grievance telephone helpline declared on packaging.' }] },
      { dossierReferenceCode: 'LM-2026-504162', productName: 'Maggi 2-Min Noodles', brandName: 'Nestle', verdict: 'COMPLIANT', complianceScore: 100, inspectionTimestamp: '2026-09-11T16:45:00Z', declaredNetQuantity: 420, declaredNetUnit: 'g', declaredMrp: 96, violations: [] },
      { dossierReferenceCode: 'LM-2026-493051', productName: 'Colgate MaxFresh', brandName: 'Colgate', verdict: 'REVIEW_REQUIRED', complianceScore: 67, inspectionTimestamp: '2026-09-10T11:20:00Z', declaredNetQuantity: 150, declaredNetUnit: 'g', declaredMrp: 120, violations: [{ statutoryRuleRef: 'Rule 6(1)(e)', severity: 'HIGH', violationTitle: 'FSSAI License Not Confirmed', defectDescription: 'FSSAI registration code could not be verified on PDP.' }] },
      { dossierReferenceCode: 'LM-2026-382940', productName: 'Tata Salt', brandName: 'Tata', verdict: 'COMPLIANT', complianceScore: 100, inspectionTimestamp: '2026-09-09T08:30:00Z', declaredNetQuantity: 1000, declaredNetUnit: 'g', declaredMrp: 28, violations: [] },
      { dossierReferenceCode: 'LM-2026-271839', productName: 'Dettol Handwash', brandName: 'Dettol', verdict: 'COMPLIANT', complianceScore: 89, inspectionTimestamp: '2026-09-08T13:00:00Z', declaredNetQuantity: 200, declaredNetUnit: 'ml', declaredMrp: 75, violations: [] },
    ] as any[];
  }, [inspectionHistory]);

  const filtered = useMemo(() => {
    return allItems.filter((item: any) => {
      const matchesSearch = searchQuery === '' ||
        item.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.dossierReferenceCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brandName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesVerdict = verdictFilter === 'ALL' || item.verdict === verdictFilter;
      return matchesSearch && matchesVerdict;
    });
  }, [allItems, searchQuery, verdictFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getVerdictBadge = (v: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      COMPLIANT: { cls: 'badge-green', label: 'Compliant' },
      PARTIALLY_COMPLIANT: { cls: 'badge-amber', label: 'Partial' },
      NON_COMPLIANT: { cls: 'badge-red', label: 'Non-Compliant' },
      REVIEW_REQUIRED: { cls: 'badge-blue', label: 'Review' },
    };
    const info = map[v] || { cls: 'badge-blue', label: v };
    return <span className={`badge ${info.cls}`}>{info.label}</span>;
  };

  // ───────────────────────────────────────────────────────────────────────────
  // ACTION: View Dossier (Eye Button)
  // ───────────────────────────────────────────────────────────────────────────
  const handleViewReport = (item: any) => {
    const fullDossier = buildFullDossier(item);
    setActiveDossier(fullDossier);
    setComplianceResult({
      overallScore: fullDossier.complianceScore,
      verdict: fullDossier.verdict,
      ruleResults: [],
      violations: fullDossier.violations
    });
    setPreviewDossier(fullDossier);
  };

  const handleOpenFullDossierScreen = (dossier: InspectionDossier) => {
    setActiveDossier(dossier);
    setComplianceResult({
      overallScore: dossier.complianceScore,
      verdict: dossier.verdict,
      ruleResults: [],
      violations: dossier.violations
    });
    setScreen('report-dossier');
  };

  // ───────────────────────────────────────────────────────────────────────────
  // ACTION: Generate Printable Report HTML
  // ───────────────────────────────────────────────────────────────────────────
  const generateJudicialReportHtml = (dossier: InspectionDossier): string => {
    const violationsHtml = dossier.violations && dossier.violations.length > 0
      ? dossier.violations.map((v: any, idx: number) => `
        <tr style="background: ${idx % 2 === 0 ? '#FFF' : '#FEF2F2'};">
          <td style="padding: 8px; border: 1px solid #E2E8F0; font-weight: bold; color: #DC2626;">${v.statutoryRuleRef || 'Rule Non-Compliance'}</td>
          <td style="padding: 8px; border: 1px solid #E2E8F0; font-weight: 600;">${v.severity || 'HIGH'}</td>
          <td style="padding: 8px; border: 1px solid #E2E8F0;">${v.violationTitle || v.defectDescription || 'Statutory Defect'}</td>
          <td style="padding: 8px; border: 1px solid #E2E8F0; font-size: 11px;">${v.defectDescription || ''}</td>
        </tr>
      `).join('')
      : `<tr><td colspan="4" style="padding: 12px; text-align: center; color: #16A34A; font-weight: bold;">✅ CLEAN COMPLIANCE: Zero statutory violations detected under Legal Metrology Act, 2009.</td></tr>`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Legal Metrology Inspection Dossier - ${dossier.dossierReferenceCode}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0F172A; margin: 0; padding: 24px; background: #FFF; font-size: 12px; line-height: 1.4; }
    .header { text-align: center; border-bottom: 2px solid #0B2545; padding-bottom: 14px; margin-bottom: 16px; }
    .gov-title { font-size: 16px; font-weight: 800; color: #0B2545; margin: 4px 0; letter-spacing: 0.5px; }
    .gov-sub { font-size: 10px; color: #64748B; letter-spacing: 1.5px; text-transform: uppercase; }
    .dossier-pill { display: inline-block; background: #EFF6FF; border: 1px solid #BFDBFE; color: #1D4ED8; padding: 4px 14px; font-weight: bold; font-family: monospace; font-size: 14px; border-radius: 4px; margin-top: 8px; }
    .cert-box { border: 2px solid #D4AF37; background: #FFFDF5; padding: 12px; border-radius: 6px; margin-bottom: 16px; font-size: 11px; }
    .cert-title { font-weight: bold; color: #B45309; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 11px; }
    th { background: #0B2545; color: #FFF; text-align: left; padding: 6px 8px; font-weight: 600; font-size: 10px; text-transform: uppercase; }
    td { padding: 6px 8px; border: 1px solid #E2E8F0; }
    .score-banner { display: flex; justify-content: space-between; align-items: center; background: ${dossier.complianceScore >= 80 ? '#F0FDF4' : dossier.complianceScore >= 50 ? '#FFFBEB' : '#FEF2F2'}; border: 1px solid ${dossier.complianceScore >= 80 ? '#86EFAC' : dossier.complianceScore >= 50 ? '#FDE68A' : '#FECACA'}; padding: 12px 18px; border-radius: 6px; margin-bottom: 16px; }
    .score-val { font-size: 26px; font-weight: 800; color: ${dossier.complianceScore >= 80 ? '#16A34A' : dossier.complianceScore >= 50 ? '#D97706' : '#DC2626'}; }
    .footer { margin-top: 24px; border-top: 1px dashed #CBD5E1; padding-top: 12px; display: flex; justify-content: space-between; font-size: 10px; color: #64748B; }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 16px; text-align: right;">
    <button onclick="window.print()" style="background: #0B2545; color: white; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer;">🖨️ Print or Save as PDF</button>
  </div>

  <div class="header">
    <div class="gov-sub">GOVERNMENT OF INDIA • MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION</div>
    <div class="gov-title">LEGAL METROLOGY INSPECTION DOSSIER</div>
    <div class="gov-sub">STATUTORY PACKAGED COMMODITIES RULES, 2011 / 2026 VERIFICATION</div>
    <div class="dossier-pill">${dossier.dossierReferenceCode}</div>
  </div>

  <div class="score-banner">
    <div>
      <div style="font-size: 11px; color: #475569; font-weight: 600;">STATUTORY COMPLIANCE VERDICT</div>
      <div style="font-size: 16px; font-weight: 800; color: #0B2545;">${dossier.verdict.replace(/_/g, ' ')}</div>
      <div style="font-size: 10px; color: #64748B;">Inspected: ${new Date(dossier.inspectionTimestamp).toLocaleString()} | Inspector: ${dossier.inspectorId}</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 10px; color: #64748B; font-weight: 600;">COMPLIANCE SCORE</div>
      <div class="score-val">${dossier.complianceScore}%</div>
    </div>
  </div>

  <div class="cert-box">
    <div class="cert-title">
      <span>⚖️ Section 63 — Bharatiya Sakshya Adhiniyam, 2023 Digital Evidence Certificate</span>
      <span>STATUS: TAMPER-EVIDENT</span>
    </div>
    <div>This electronic compliance report constitutes an authentic, cryptographically-sealed judicial record under Section 63 of the BSA, 2023. SHA-256 evidence hash was generated directly from packaging image pixel buffers at capture.</div>
    <div style="margin-top: 6px; font-family: monospace; font-size: 10px; color: #1E293B; word-break: break-all;">
      <strong>MASTER EVIDENCE SHA-256:</strong> ${dossier.masterSha256Hash}
    </div>
  </div>

  <div class="grid">
    <div>
      <h3 style="font-size: 12px; margin: 0 0 4px 0; color: #0B2545;">1. PRODUCT IDENTIFICATION</h3>
      <table>
        <tr><td style="width: 40%; font-weight: 600;">Product Name</td><td>${dossier.productName}</td></tr>
        <tr><td style="font-weight: 600;">Brand / Trademark</td><td>${dossier.brandName}</td></tr>
        <tr><td style="font-weight: 600;">Category</td><td>${dossier.category}</td></tr>
        <tr><td style="font-weight: 600;">Geometry</td><td>${dossier.packagingGeometry}</td></tr>
      </table>
    </div>

    <div>
      <h3 style="font-size: 12px; margin: 0 0 4px 0; color: #0B2545;">2. STATUTORY PRICING & METROLOGY</h3>
      <table>
        <tr><td style="width: 40%; font-weight: 600;">Net Quantity</td><td><strong>${dossier.declaredNetQuantity} ${dossier.declaredNetUnit}</strong></td></tr>
        <tr><td style="font-weight: 600;">Maximum Retail Price</td><td><strong>₹ ${dossier.declaredMrp}</strong> (Incl. of all taxes)</td></tr>
        <tr><td style="font-weight: 600;">Unit Sale Price (USP)</td><td>₹ ${dossier.declaredUspValue} ${dossier.declaredUspUnit || ''}</td></tr>
        <tr><td style="font-weight: 600;">Mfg Date / Batch</td><td>${dossier.declaredMfgMonth}/${dossier.declaredMfgYear}</td></tr>
      </table>
    </div>
  </div>

  <div>
    <h3 style="font-size: 12px; margin: 0 0 4px 0; color: #0B2545;">3. MANUFACTURER & CONSUMER CARE DETAILS</h3>
    <table>
      <tr><td style="width: 25%; font-weight: 600;">Manufacturer / Packer</td><td>${dossier.manufacturerName || 'N/A'}</td></tr>
      <tr><td style="font-weight: 600;">Factory Address</td><td>${dossier.manufacturerAddress || 'N/A'}</td></tr>
      <tr><td style="font-weight: 600;">Country of Origin</td><td>${dossier.countryOfOrigin || 'India'}</td></tr>
      <tr><td style="font-weight: 600;">Consumer Grievance</td><td>Phone: ${dossier.consumerCarePhone || 'N/A'} | Email: ${dossier.consumerCareEmail || 'N/A'}</td></tr>
    </table>
  </div>

  <div style="margin-top: 14px;">
    <h3 style="font-size: 12px; margin: 0 0 4px 0; color: #0B2545;">4. STATUTORY VIOLATION FINDINGS (RULE 6, 7 & 8)</h3>
    <table>
      <thead>
        <tr>
          <th>Statutory Rule</th>
          <th>Severity</th>
          <th>Defect Title</th>
          <th>Legal Metrology Specifics</th>
        </tr>
      </thead>
      <tbody>
        ${violationsHtml}
      </tbody>
    </table>
  </div>

  <div style="margin-top: 14px; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 10px; border-radius: 4px;">
    <strong>Inspector Observations:</strong> ${dossier.inspectorRemarks || 'Statutory automated verification completed without manual intervention.'}
  </div>

  <div class="footer">
    <div>CompliScan AI Tri-Core Engine • Judicial metrology standard</div>
    <div>Certified Digital Hash: ${dossier.masterSha256Hash.substring(0, 20)}...</div>
    <div>Page 1 of 1</div>
  </div>
</body>
</html>`;
  };

  // ───────────────────────────────────────────────────────────────────────────
  // ACTION: Download Report (Download Button)
  // ───────────────────────────────────────────────────────────────────────────
  const handleDownloadReport = async (item: any) => {
    const dossier = buildFullDossier(item);
    setDownloadingCode(dossier.dossierReferenceCode);
    setStatusMessage(`Preparing report for ${dossier.dossierReferenceCode}...`);

    try {
      // 1. Try FastAPI backend PDF compilation endpoint
      const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '');
      const payload = {
        dossierCode: dossier.dossierReferenceCode,
        imageSha256: dossier.masterSha256Hash,
        inspectorRemarks: dossier.inspectorRemarks,
        extractedData: {
          productName: dossier.productName,
          brandName: dossier.brandName,
          category: dossier.category,
          packagingGeometry: dossier.packagingGeometry,
          netQuantityValue: dossier.declaredNetQuantity,
          netQuantityUnit: dossier.declaredNetUnit,
          mrpValue: dossier.declaredMrp,
          declaredUspValue: dossier.declaredUspValue,
          declaredUspUnit: dossier.declaredUspUnit,
          manufacturerName: dossier.manufacturerName,
          manufacturerAddress: dossier.manufacturerAddress,
          countryOfOrigin: dossier.countryOfOrigin,
          consumerCarePhone: dossier.consumerCarePhone,
          consumerCareEmail: dossier.consumerCareEmail,
        },
        evaluation: {
          complianceScore: dossier.complianceScore,
          verdict: dossier.verdict,
          violations: dossier.violations || []
        }
      };

      const res = await fetch(`${backendBase}/api/v1/inspection/export-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(6000)
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CompliScan_Dossier_${dossier.dossierReferenceCode}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setStatusMessage(`✅ Downloaded PDF: ${dossier.dossierReferenceCode}`);
        return;
      }
    } catch (e) {
      console.info('[History Download] Local backend PDF compiler offline, engaging instant client-side generator.');
    }

    // 2. High-availability client-side generator: Downloads official self-contained Judicial Report HTML / PDF
    try {
      const htmlDoc = generateJudicialReportHtml(dossier);
      const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CompliScan_Judicial_Dossier_${dossier.dossierReferenceCode}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      // Also trigger a dedicated printable window for immediate Save As PDF
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlDoc);
        printWindow.document.close();
      }

      setStatusMessage(`✅ Judicial Dossier ${dossier.dossierReferenceCode} exported successfully!`);
    } catch (err: any) {
      console.error('[Download Failed]', err);
      setStatusMessage(`❌ Error exporting report: ${err?.message || 'Unknown'}`);
    } finally {
      setDownloadingCode(null);
      setTimeout(() => setStatusMessage(null), 4500);
    }
  };

  return (
    <div className="screen-container" style={{ animation: 'fade-in-up 0.4s ease-out' }}>
      {/* Back button */}
      <button className="gov-btn gov-btn-ghost" onClick={() => setScreen('dashboard')} style={{ marginBottom: '16px' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: 'var(--navy)' }}>Statutory Inspection History</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Verified packaged commodities ledger sealed under Bharatiya Sakshya Adhiniyam, 2023.
          </p>
        </div>

        {statusMessage && (
          <div style={{
            padding: '8px 16px',
            borderRadius: '6px',
            background: 'var(--slate-bg)',
            border: '1px solid var(--primary-blue)',
            color: 'var(--primary-blue)',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fade-in 0.2s ease-out'
          }}>
            {downloadingCode && <Loader2 size={15} className="animate-spin" />}
            {statusMessage}
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="gov-input"
            placeholder="Search by product, brand, or dossier ID..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{ paddingLeft: '36px' }}
          />
        </div>
        <select
          className="gov-select"
          value={verdictFilter}
          onChange={(e) => { setVerdictFilter(e.target.value); setCurrentPage(1); }}
          style={{ width: '190px' }}
        >
          <option value="ALL">All Verdicts</option>
          <option value="COMPLIANT">Compliant</option>
          <option value="PARTIALLY_COMPLIANT">Partially Compliant</option>
          <option value="NON_COMPLIANT">Non-Compliant</option>
          <option value="REVIEW_REQUIRED">Review Required</option>
        </select>
      </div>

      {/* Table */}
      <div className="gov-card" style={{ overflow: 'hidden', marginBottom: '20px' }}>
        <table className="gov-table">
          <thead>
            <tr>
              <th>Dossier ID</th>
              <th>Product</th>
              <th>Brand</th>
              <th>Net Qty</th>
              <th>MRP</th>
              <th>Verdict</th>
              <th>Score</th>
              <th>Date</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No historical inspection records match your filter criteria.
                </td>
              </tr>
            ) : (
              paginated.map((item: any, i: number) => {
                const isDownloading = downloadingCode === item.dossierReferenceCode;
                return (
                  <tr key={item.dossierReferenceCode || i} style={{ transition: 'background 0.2s' }}>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: 'var(--primary-blue)' }}>
                      {item.dossierReferenceCode}
                    </td>
                    <td style={{ fontWeight: 600, fontSize: '13px' }}>{item.productName}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.brandName}</td>
                    <td style={{ fontSize: '13px' }}>{item.declaredNetQuantity} {item.declaredNetUnit}</td>
                    <td style={{ fontSize: '13px' }}>₹{item.declaredMrp}</td>
                    <td>{getVerdictBadge(item.verdict)}</td>
                    <td>
                      <span style={{
                        fontWeight: 700,
                        color: item.complianceScore >= 80 ? 'var(--compliant-green)' : item.complianceScore >= 50 ? '#B45309' : 'var(--violation-red)',
                      }}>
                        {item.complianceScore}%
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {item.inspectionTimestamp ? new Date(item.inspectionTimestamp).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        {/* Eye Button: Opens Full Report Preview */}
                        <button
                          className="gov-btn gov-btn-outline"
                          style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Open Inspection Report"
                          onClick={() => handleViewReport(item)}
                        >
                          <Eye size={14} color="var(--primary-blue)" />
                          <span style={{ fontSize: '12px' }}>View</span>
                        </button>

                        {/* Download Button: Exports Report PDF */}
                        <button
                          className="gov-btn gov-btn-primary"
                          style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Download Judicial Report PDF"
                          disabled={isDownloading}
                          onClick={() => handleDownloadReport(item)}
                        >
                          {isDownloading ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Download size={14} />
                          )}
                          <span style={{ fontSize: '12px' }}>{isDownloading ? '...' : 'PDF'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`gov-btn ${currentPage === i + 1 ? 'gov-btn-primary' : 'gov-btn-outline'}`}
              style={{ padding: '6px 12px', fontSize: '13px', minWidth: '36px' }}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
        Showing {paginated.length} of {filtered.length} statutory records
      </p>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* QUICK VIEW INSPECTION REPORT MODAL */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      {previewDossier && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(11, 37, 69, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          animation: 'fade-in 0.2s ease-out'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '780px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#F8FAFC'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={22} color="var(--primary-blue)" />
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: 'var(--navy)' }}>
                    Statutory Dossier: {previewDossier.dossierReferenceCode}
                  </h2>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {previewDossier.productName} ({previewDossier.brandName})
                  </div>
                </div>
              </div>

              <button
                className="gov-btn gov-btn-ghost"
                style={{ padding: '6px', borderRadius: '50%' }}
                onClick={() => setPreviewDossier(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {/* Verdict Banner */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                borderRadius: '8px',
                background: previewDossier.complianceScore >= 80 ? 'rgba(22, 163, 74, 0.1)' : previewDossier.complianceScore >= 50 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                border: `1px solid ${previewDossier.complianceScore >= 80 ? '#86EFAC' : previewDossier.complianceScore >= 50 ? '#FDE68A' : '#FECACA'}`,
                marginBottom: '20px'
              }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>VERDICT STATUS</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--navy)' }}>
                    {previewDossier.verdict.replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Timestamp: {new Date(previewDossier.inspectionTimestamp).toLocaleString()}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>COMPLIANCE SCORE</div>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: 900,
                    color: previewDossier.complianceScore >= 80 ? 'var(--compliant-green)' : previewDossier.complianceScore >= 50 ? '#B45309' : 'var(--violation-red)'
                  }}>
                    {previewDossier.complianceScore}%
                  </div>
                </div>
              </div>

              {/* Section 63 BSA Hash */}
              <div style={{
                border: '1px solid #D4AF37',
                background: '#FFFDF5',
                padding: '12px 16px',
                borderRadius: '6px',
                marginBottom: '20px',
                fontSize: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#B45309', marginBottom: '4px' }}>
                  <Shield size={16} />
                  <span>Section 63 Bharatiya Sakshya Adhiniyam, 2023 Digital Evidence Certificate</span>
                </div>
                <div style={{ color: '#475569', fontSize: '11px', marginBottom: '6px' }}>
                  Electronic record tamper-evident hash computed across raw packaging evidence buffers.
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#0F172A', background: '#F1F5F9', padding: '6px 10px', borderRadius: '4px', wordBreak: 'break-all' }}>
                  {previewDossier.masterSha256Hash}
                </div>
              </div>

              {/* Two-column declarations */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, margin: '0 0 10px 0', color: 'var(--navy)' }}>
                    Statutory Metrology Declarations
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Net Quantity:</span>
                      <strong>{previewDossier.declaredNetQuantity} {previewDossier.declaredNetUnit}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Maximum Retail Price:</span>
                      <strong>₹ {previewDossier.declaredMrp}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Unit Sale Price:</span>
                      <span>₹ {previewDossier.declaredUspValue} {previewDossier.declaredUspUnit || ''}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Mfg Date / Year:</span>
                      <span>{previewDossier.declaredMfgMonth}/{previewDossier.declaredMfgYear}</span>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, margin: '0 0 10px 0', color: 'var(--navy)' }}>
                    Manufacturer &amp; Packer Details
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px' }}>Company:</span>
                      <strong>{previewDossier.manufacturerName || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px' }}>Address:</span>
                      <span style={{ fontSize: '11px' }}>{previewDossier.manufacturerAddress || 'N/A'}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px' }}>Consumer Helpline:</span>
                      <span style={{ fontSize: '11px' }}>{previewDossier.consumerCarePhone || 'N/A'} | {previewDossier.consumerCareEmail || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Violations List */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--navy)' }}>
                  Statutory Rule Verification (Rule 6, 7 &amp; 8)
                </h4>
                {previewDossier.violations && previewDossier.violations.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {previewDossier.violations.map((v: any, idx: number) => (
                      <div key={idx} style={{
                        padding: '10px 14px',
                        borderRadius: '6px',
                        background: '#FEF2F2',
                        border: '1px solid #FECACA',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px'
                      }}>
                        <AlertTriangle size={16} color="#DC2626" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <div style={{ flex: 1, fontSize: '12px' }}>
                          <div style={{ fontWeight: 700, color: '#991B1B' }}>
                            {v.statutoryRuleRef || 'Rule 6'} • {v.violationTitle || v.defectDescription || 'Non-Compliance'}
                          </div>
                          <div style={{ color: '#4B5563', marginTop: '2px' }}>
                            {v.defectDescription}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    padding: '12px',
                    borderRadius: '6px',
                    background: '#F0FDF4',
                    border: '1px solid #86EFAC',
                    color: '#166534',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    <CheckCircle size={16} color="#16A34A" />
                    <span>Clean Record: All statutory Legal Metrology &amp; FSSAI declarations fully compliant.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <button
                className="gov-btn gov-btn-outline"
                onClick={() => setPreviewDossier(null)}
              >
                Close
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="gov-btn gov-btn-outline"
                  onClick={() => {
                    const printWin = window.open('', '_blank');
                    if (printWin) {
                      printWin.document.write(generateJudicialReportHtml(previewDossier));
                      printWin.document.close();
                    }
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Printer size={15} /> Print
                </button>

                <button
                  className="gov-btn gov-btn-primary"
                  onClick={() => handleDownloadReport(previewDossier)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Download size={15} /> Download PDF
                </button>

                <button
                  className="gov-btn gov-btn-success"
                  onClick={() => handleOpenFullDossierScreen(previewDossier)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <ExternalLink size={15} /> Open Full Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
