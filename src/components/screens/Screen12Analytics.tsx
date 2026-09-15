'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

export default function Screen12Analytics() {
  const { setScreen } = useAppStore();

  const monthlyData = [
    { month: 'Apr', inspections: 18, violations: 5 },
    { month: 'May', inspections: 24, violations: 8 },
    { month: 'Jun', inspections: 20, violations: 6 },
    { month: 'Jul', inspections: 32, violations: 10 },
    { month: 'Aug', inspections: 28, violations: 7 },
    { month: 'Sep', inspections: 15, violations: 4 },
  ];

  const verdictData = [
    { name: 'Compliant', value: 58, color: '#16A34A' },
    { name: 'Partial', value: 25, color: '#F59E0B' },
    { name: 'Non-Compliant', value: 12, color: '#DC2626' },
    { name: 'Review', value: 5, color: '#1D4ED8' },
  ];

  const violationCategoryData = [
    { rule: 'Rule 7 Font', count: 14 },
    { rule: 'Rule 6(11) USP', count: 11 },
    { rule: 'Rule 6(1)(a)', count: 8 },
    { rule: 'Rule 6(2)', count: 6 },
    { rule: 'Rule 8 COO', count: 4 },
  ];

  const trendData = [
    { month: 'Apr', rate: 72 },
    { month: 'May', rate: 68 },
    { month: 'Jun', rate: 75 },
    { month: 'Jul', rate: 71 },
    { month: 'Aug', rate: 80 },
    { month: 'Sep', rate: 85 },
  ];

  return (
    <div className="screen-container" style={{ animation: 'fade-in-up 0.4s ease-out' }}>
      <button className="gov-btn gov-btn-ghost" onClick={() => setScreen('dashboard')} style={{ marginBottom: '16px' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <TrendingUp size={24} color="var(--primary-blue)" />
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Analytics & Reports</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Inspections Over Time */}
        <div className="gov-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Inspections Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" fontSize={12} tick={{ fill: '#64748B' }} />
              <YAxis fontSize={12} tick={{ fill: '#64748B' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px' }} />
              <Bar dataKey="inspections" fill="#1D4ED8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="violations" fill="#DC2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Verdict Distribution */}
        <div className="gov-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Verdict Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={verdictData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
                labelLine={{ stroke: '#94A3B8' }}
              >
                {verdictData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Top Violation Categories */}
        <div className="gov-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Top Violation Categories</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={violationCategoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" fontSize={12} tick={{ fill: '#64748B' }} />
              <YAxis type="category" dataKey="rule" fontSize={11} tick={{ fill: '#64748B' }} width={100} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px' }} />
              <Bar dataKey="count" fill="#F59E0B" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Compliance Trend */}
        <div className="gov-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Compliance Rate Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" fontSize={12} tick={{ fill: '#64748B' }} />
              <YAxis domain={[0, 100]} fontSize={12} tick={{ fill: '#64748B' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px' }} />
              <Line type="monotone" dataKey="rate" stroke="#16A34A" strokeWidth={3} dot={{ r: 5, fill: '#16A34A' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
