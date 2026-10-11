'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'SUPERVISOR';
}

export default function AdminGuard({ children, requiredRole = 'ADMIN' }: AdminGuardProps) {
  const { currentInspector, setScreen, isAuthenticated } = useAppStore();

  const userRole = currentInspector?.role || 'INSPECTOR';
  const hasAccess = isAuthenticated && (userRole === requiredRole || userRole === 'ADMIN');

  if (!hasAccess) {
    return (
      <div className="screen-container" style={{ animation: 'fade-in-up 0.4s ease-out' }}>
        <button
          className="gov-btn gov-btn-ghost"
          onClick={() => setScreen('dashboard')}
          style={{ marginBottom: '16px' }}
        >
          <ArrowLeft size={16} /> Return to Inspection Dashboard
        </button>

        <div className="gov-card" style={{ padding: '36px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(220, 38, 38, 0.1)',
            border: '2px solid rgba(220, 38, 38, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <ShieldAlert size={36} color="#DC2626" />
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Access Restricted — Administrative Role Required
          </h2>

          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
            This resource is protected by <strong>CompliScan AI Role-Based Access Control (RBAC)</strong>.
            Your current account (<strong>{currentInspector?.badgeNumber || 'Anonymous'}</strong>) is assigned the 
            role <span style={{
              display: 'inline-block',
              background: 'rgba(212, 175, 55, 0.15)',
              color: '#B45309',
              padding: '2px 8px',
              borderRadius: '4px',
              fontWeight: 600,
              fontSize: '12px',
            }}>{userRole}</span>.
            Access to administrative settings and statutory rule configurations requires <strong>{requiredRole}</strong> credentials.
          </p>

          <div style={{
            padding: '14px',
            background: 'var(--slate-bg)',
            borderRadius: 'var(--radius-md)',
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginBottom: '24px',
            textAlign: 'left',
          }}>
            <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--text-secondary)' }}>
              <Lock size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Security Audit Notice
            </div>
            Unauthorized administrative access attempts are logged with client IP, timestamp, and hardware identifier under Section 63 BSA 2023 evidentiary compliance protocols.
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              className="gov-btn gov-btn-primary"
              onClick={() => setScreen('dashboard')}
            >
              Go to Dashboard
            </button>
            <button
              className="gov-btn gov-btn-outline"
              onClick={() => setScreen('login')}
            >
              Switch Account (Login as Admin)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
