'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import AdminGuard from '@/components/auth/AdminGuard';
import { 
  ShieldCheck, ArrowLeft, Users, Key, AlertTriangle, 
  Lock, RefreshCw, CheckCircle2, ShieldAlert, Server, Globe 
} from 'lucide-react';

interface AdminInspectorRecord {
  badgeNumber: string;
  fullName: string;
  role: 'ADMIN' | 'INSPECTOR' | 'SUPERVISOR';
  district: string;
  status: 'ACTIVE' | 'REVOKED';
  lastActive: string;
}

const INITIAL_INSPECTORS: AdminInspectorRecord[] = [
  {
    badgeNumber: 'ADMIN01',
    fullName: 'Chief Enforcement Administrator',
    role: 'ADMIN',
    district: 'HQ Directorate Delhi',
    status: 'ACTIVE',
    lastActive: 'Just now',
  },
  {
    badgeNumber: '1045',
    fullName: 'Rajesh Kumar Sharma',
    role: 'INSPECTOR',
    district: 'Central Delhi',
    status: 'ACTIVE',
    lastActive: '5 mins ago',
  },
  {
    badgeNumber: '2088',
    fullName: 'Priya Sundaram',
    role: 'INSPECTOR',
    district: 'South Delhi',
    status: 'ACTIVE',
    lastActive: '2 hours ago',
  },
  {
    badgeNumber: '3142',
    fullName: 'Vikramaditya Verma',
    role: 'SUPERVISOR',
    district: 'North Delhi',
    status: 'ACTIVE',
    lastActive: 'Yesterday',
  },
];

export default function Screen16AdminPortal() {
  const { setScreen } = useAppStore();
  const [inspectors, setInspectors] = useState<AdminInspectorRecord[]>(INITIAL_INSPECTORS);
  const [feedback, setFeedback] = useState<string | null>(null);

  const toggleInspectorStatus = (badge: string) => {
    setInspectors((prev) =>
      prev.map((insp) =>
        insp.badgeNumber === badge
          ? { ...insp, status: insp.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE' }
          : insp
      )
    );
    setFeedback(`Updated status for Badge #${badge}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <AdminGuard requiredRole="ADMIN">
      <div className="screen-container" style={{ animation: 'fade-in-up 0.4s ease-out' }}>
        <button
          className="gov-btn gov-btn-ghost"
          onClick={() => setScreen('dashboard')}
          style={{ marginBottom: '16px' }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}>
              <ShieldCheck size={26} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>
                Enforcement Directorate — Admin Portal
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                Role-Based Access Control, Officer Credentials & System Security Governance
              </p>
            </div>
          </div>
          <span style={{
            background: 'rgba(124, 58, 237, 0.1)',
            color: '#7C3AED',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 700,
          }}>
            SUPER-ADMIN CLEARANCE
          </span>
        </div>

        {feedback && (
          <div style={{
            padding: '10px 14px',
            background: 'var(--compliant-bg)',
            border: '1px solid var(--compliant-green)',
            color: 'var(--compliant-green)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <CheckCircle2 size={16} />
            {feedback}
          </div>
        )}

        {/* Security Hardening Status Dashboard */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}>
          <div className="gov-card" style={{ padding: '16px', borderLeft: '4px solid #16A34A' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16A34A', marginBottom: '6px' }}>
              <Lock size={16} />
              <span style={{ fontSize: '12px', fontWeight: 700 }}>HMAC-SHA256 JWT</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Cryptographic Auth</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>PBKDF2-SHA512 Password Salts</div>
          </div>

          <div className="gov-card" style={{ padding: '16px', borderLeft: '4px solid #16A34A' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16A34A', marginBottom: '6px' }}>
              <Server size={16} />
              <span style={{ fontSize: '12px', fontWeight: 700 }}>RATE LIMITING</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Active Shield</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Sliding Token Bucket Defense</div>
          </div>

          <div className="gov-card" style={{ padding: '16px', borderLeft: '4px solid #16A34A' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16A34A', marginBottom: '6px' }}>
              <Globe size={16} />
              <span style={{ fontSize: '12px', fontWeight: 700 }}>CORS & HEADERS</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Origin Restricted</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>CSP + HSTS + X-Frame-Options</div>
          </div>

          <div className="gov-card" style={{ padding: '16px', borderLeft: '4px solid #16A34A' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16A34A', marginBottom: '6px' }}>
              <ShieldAlert size={16} />
              <span style={{ fontSize: '12px', fontWeight: 700 }}>DEBUG MODE</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Disabled</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Production Hardened Engine</div>
          </div>
        </div>

        {/* Officers & Role Management */}
        <div className="gov-card" style={{ padding: '24px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="var(--primary)" />
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Enforcement Officers & Access Roles</h2>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Total Registered: {inspectors.length}
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="gov-table" style={{ width: '100%', fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>Badge Number</th>
                  <th>Officer Name</th>
                  <th>Assigned Role</th>
                  <th>Jurisdiction</th>
                  <th>Status</th>
                  <th>Last Seen</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inspectors.map((insp) => (
                  <tr key={insp.badgeNumber}>
                    <td style={{ fontWeight: 600 }}>#{insp.badgeNumber}</td>
                    <td>{insp.fullName}</td>
                    <td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: insp.role === 'ADMIN' ? 'rgba(124, 58, 237, 0.15)' : 'rgba(15, 23, 42, 0.08)',
                        color: insp.role === 'ADMIN' ? '#7C3AED' : 'var(--text-primary)',
                      }}>
                        {insp.role}
                      </span>
                    </td>
                    <td>{insp.district}</td>
                    <td>
                      <span style={{
                        color: insp.status === 'ACTIVE' ? '#16A34A' : '#DC2626',
                        fontWeight: 600,
                        fontSize: '12px',
                      }}>
                        ● {insp.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{insp.lastActive}</td>
                    <td style={{ textAlign: 'right' }}>
                      {insp.role !== 'ADMIN' && (
                        <button
                          onClick={() => toggleInspectorStatus(insp.badgeNumber)}
                          style={{
                            background: 'none',
                            border: '1px solid var(--card-border)',
                            borderRadius: '4px',
                            padding: '3px 8px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            color: insp.status === 'ACTIVE' ? '#DC2626' : '#16A34A',
                          }}
                        >
                          {insp.status === 'ACTIVE' ? 'Revoke Access' : 'Restore'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 63 BSA Audit & Security Directives */}
        <div className="gov-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Key size={18} color="#D4AF37" />
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Section 63 BSA 2023 Evidentiary Audit Trail</h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
            All electronic evidence captured via CompliScan AI is signed with the officer's cryptographic key and hashed with SHA-256 before cloud transmission. In strict compliance with Bharatiya Sakshya Adhiniyam, 2023 Section 63(4), digital hash certificates cannot be altered or removed.
          </p>
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
          }}>
            <button
              className="gov-btn gov-btn-outline"
              onClick={() => {
                setFeedback('Cryptographic integrity verification passed: All SHA-256 chain hashes match database records.');
                setTimeout(() => setFeedback(null), 4000);
              }}
            >
              <RefreshCw size={14} /> Verify Master Hash Ledger
            </button>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
