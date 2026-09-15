'use client';

import React, { useEffect, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import {
  ClipboardCheck, AlertTriangle, Clock, TrendingUp, Plus,
  ChevronRight, BarChart3, History, Settings
} from 'lucide-react';

export default function Screen02Dashboard() {
  const {
    currentInspector, setScreen, dashboardKPIs, setDashboardKPIs,
    inspectionHistory, offlineQueue,
  } = useAppStore();

  useEffect(() => {
    // Compute KPIs from history
    const total = inspectionHistory.length || 12;
    const violations = inspectionHistory.reduce(
      (sum, d) => sum + (d.violations?.length || 0), 0
    ) || 8;
    const reviews = inspectionHistory.filter(
      (d) => d.verdict === 'REVIEW_REQUIRED'
    ).length || 2;
    const compliant = inspectionHistory.filter(
      (d) => d.verdict === 'COMPLIANT'
    ).length || 7;
    const rate = total > 0 ? Math.round((compliant / total) * 100) : 85;
    setDashboardKPIs({
      totalInspections: total,
      totalViolations: violations,
      pendingReviews: reviews,
      complianceRate: rate,
    });
  }, [inspectionHistory, setDashboardKPIs]);

  const kpiCards = [
    { label: 'Total Inspections', value: dashboardKPIs.totalInspections, icon: ClipboardCheck, color: 'var(--primary-blue)', bg: '#DBEAFE' },
    { label: 'Violations Found', value: dashboardKPIs.totalViolations, icon: AlertTriangle, color: 'var(--violation-red)', bg: 'var(--violation-red-bg)' },
    { label: 'Pending Reviews', value: dashboardKPIs.pendingReviews, icon: Clock, color: '#B45309', bg: 'var(--amber-warning-bg)' },
    { label: 'Compliance Rate', value: `${dashboardKPIs.complianceRate}%`, icon: TrendingUp, color: 'var(--compliant-green)', bg: 'var(--compliant-green-bg)' },
  ];

  const recentInspections = useMemo(() => {
    if (inspectionHistory.length > 0) return inspectionHistory.slice(0, 5);
    return [
      { dossierReferenceCode: 'LM-2026-847291', productName: 'Parle-G Gold Biscuits', verdict: 'COMPLIANT', complianceScore: 100, inspectionTimestamp: '2026-09-14T10:30:00Z' },
      { dossierReferenceCode: 'LM-2026-729384', productName: 'Fortune Refined Oil', verdict: 'PARTIALLY_COMPLIANT', complianceScore: 78, inspectionTimestamp: '2026-09-13T14:15:00Z' },
      { dossierReferenceCode: 'LM-2026-618273', productName: 'Dove Body Wash', verdict: 'NON_COMPLIANT', complianceScore: 44, inspectionTimestamp: '2026-09-12T09:00:00Z' },
      { dossierReferenceCode: 'LM-2026-504162', productName: 'Maggi 2-Minute Noodles', verdict: 'COMPLIANT', complianceScore: 100, inspectionTimestamp: '2026-09-11T16:45:00Z' },
      { dossierReferenceCode: 'LM-2026-493051', productName: 'Colgate MaxFresh', verdict: 'REVIEW_REQUIRED', complianceScore: 67, inspectionTimestamp: '2026-09-10T11:20:00Z' },
    ];
  }, [inspectionHistory]);

  const getVerdictBadge = (verdict: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      COMPLIANT: { cls: 'badge-green', label: 'Compliant' },
      PARTIALLY_COMPLIANT: { cls: 'badge-amber', label: 'Partial' },
      NON_COMPLIANT: { cls: 'badge-red', label: 'Non-Compliant' },
      REVIEW_REQUIRED: { cls: 'badge-blue', label: 'Review' },
    };
    const info = map[verdict] || { cls: 'badge-blue', label: verdict };
    return <span className={`badge ${info.cls}`}>{info.label}</span>;
  };

  // Simple donut chart
  const donutData = [
    { label: 'Compliant', value: 58, color: 'var(--compliant-green)' },
    { label: 'Partial', value: 25, color: 'var(--amber-warning)' },
    { label: 'Non-Compliant', value: 12, color: 'var(--violation-red)' },
    { label: 'Review', value: 5, color: 'var(--primary-blue)' },
  ];

  const totalDonut = donutData.reduce((s, d) => s + d.value, 0);
  let cumulativePercent = 0;

  return (
    <div className="screen-container" style={{ animation: 'fade-in-up 0.4s ease-out' }}>
      {/* Welcome */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Welcome, {currentInspector?.fullName?.split(' ')[0] || 'Inspector'}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Badge #{currentInspector?.badgeNumber} • {currentInspector?.assignedDistrict}
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {kpiCards.map((kpi, i) => (
          <div
            key={i}
            className="gov-card"
            style={{
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              animationDelay: `${i * 0.1}s`,
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: kpi.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <kpi.icon size={24} color={kpi.color} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap',
      }}>
        <button className="gov-btn gov-btn-primary" onClick={() => setScreen('new-start')}>
          <Plus size={16} /> New Inspection
        </button>
        <button className="gov-btn gov-btn-outline" onClick={() => setScreen('history-table')}>
          <History size={16} /> View History
        </button>
        <button className="gov-btn gov-btn-outline" onClick={() => setScreen('analytics')}>
          <BarChart3 size={16} /> Analytics
        </button>
        <button className="gov-btn gov-btn-outline" onClick={() => setScreen('regulations')}>
          <Settings size={16} /> Regulations
        </button>
        {offlineQueue.length > 0 && (
          <button className="gov-btn gov-btn-outline" onClick={() => setScreen('offline-sync')} style={{ borderColor: 'var(--amber-warning)', color: '#B45309' }}>
            <Clock size={16} /> {offlineQueue.length} Pending Sync
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        {/* Recent Inspections */}
        <div className="gov-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Recent Inspections</h2>
            <button className="gov-btn gov-btn-ghost" style={{ fontSize: '13px', padding: '4px 8px' }} onClick={() => setScreen('history-table')}>
              View All <ChevronRight size={14} />
            </button>
          </div>
          <table className="gov-table">
            <thead>
              <tr>
                <th>Dossier ID</th>
                <th>Product</th>
                <th>Verdict</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {recentInspections.map((insp: any, i: number) => (
                <tr key={i} style={{ cursor: 'pointer' }}>
                  <td style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--primary-blue)' }}>
                    {insp.dossierReferenceCode}
                  </td>
                  <td>{insp.productName}</td>
                  <td>{getVerdictBadge(insp.verdict)}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: insp.complianceScore >= 80 ? 'var(--compliant-green)' : insp.complianceScore >= 50 ? '#B45309' : 'var(--violation-red)' }}>
                      {insp.complianceScore}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Donut Chart */}
        <div className="gov-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Verdict Distribution</h3>
          <div style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto' }}>
            <svg viewBox="0 0 42 42" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              {donutData.map((seg, i) => {
                const percent = (seg.value / totalDonut) * 100;
                const dashArray = `${percent} ${100 - percent}`;
                const offset = cumulativePercent;
                cumulativePercent += percent;
                return (
                  <circle
                    key={i}
                    cx="21" cy="21" r="16"
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="4"
                    strokeDasharray={dashArray}
                    strokeDashoffset={-offset}
                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                  />
                );
              })}
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {dashboardKPIs.complianceRate}%
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Compliance</div>
            </div>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {donutData.map((seg, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: seg.color, flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{seg.label}</span>
                </div>
                <span style={{ fontWeight: 600 }}>{seg.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
