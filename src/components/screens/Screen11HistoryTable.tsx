'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { ArrowLeft, Search, Download, Eye, Filter, Calendar } from 'lucide-react';

export default function Screen11HistoryTable() {
  const { inspectionHistory, setScreen, setActiveDossier, setComplianceResult } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Demo data if no real history
  const allItems = useMemo(() => {
    if (inspectionHistory.length > 0) return inspectionHistory;
    return [
      { dossierReferenceCode: 'LM-2026-847291', productName: 'Parle-G Gold Biscuits', brandName: 'Parle', verdict: 'COMPLIANT', complianceScore: 100, inspectionTimestamp: '2026-09-14T10:30:00Z', declaredNetQuantity: 500, declaredNetUnit: 'g', declaredMrp: 40, violations: [] },
      { dossierReferenceCode: 'LM-2026-729384', productName: 'Fortune Sunlite Oil', brandName: 'Fortune', verdict: 'PARTIALLY_COMPLIANT', complianceScore: 78, inspectionTimestamp: '2026-09-13T14:15:00Z', declaredNetQuantity: 1000, declaredNetUnit: 'ml', declaredMrp: 180, violations: [{ severity: 'MEDIUM' }] },
      { dossierReferenceCode: 'LM-2026-618273', productName: 'Dove Body Wash', brandName: 'Dove', verdict: 'NON_COMPLIANT', complianceScore: 44, inspectionTimestamp: '2026-09-12T09:00:00Z', declaredNetQuantity: 250, declaredNetUnit: 'ml', declaredMrp: 299, violations: [{ severity: 'CRITICAL' }, { severity: 'HIGH' }] },
      { dossierReferenceCode: 'LM-2026-504162', productName: 'Maggi 2-Min Noodles', brandName: 'Nestle', verdict: 'COMPLIANT', complianceScore: 100, inspectionTimestamp: '2026-09-11T16:45:00Z', declaredNetQuantity: 420, declaredNetUnit: 'g', declaredMrp: 96, violations: [] },
      { dossierReferenceCode: 'LM-2026-493051', productName: 'Colgate MaxFresh', brandName: 'Colgate', verdict: 'REVIEW_REQUIRED', complianceScore: 67, inspectionTimestamp: '2026-09-10T11:20:00Z', declaredNetQuantity: 150, declaredNetUnit: 'g', declaredMrp: 120, violations: [{ severity: 'HIGH' }] },
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

  return (
    <div className="screen-container" style={{ animation: 'fade-in-up 0.4s ease-out' }}>
      <button className="gov-btn gov-btn-ghost" onClick={() => setScreen('dashboard')} style={{ marginBottom: '16px' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '20px' }}>Inspection History</h1>

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
          style={{ width: '180px' }}
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((item: any, i: number) => (
              <tr key={i}>
                <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--primary-blue)' }}>
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
                  {new Date(item.inspectionTimestamp).toLocaleDateString()}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="gov-btn gov-btn-ghost" style={{ padding: '4px 8px' }} title="View">
                      <Eye size={14} />
                    </button>
                    <button className="gov-btn gov-btn-ghost" style={{ padding: '4px 8px' }} title="Download">
                      <Download size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
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

      <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px' }}>
        Showing {paginated.length} of {filtered.length} records
      </p>
    </div>
  );
}
