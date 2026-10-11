'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import Screen01Login from '@/components/screens/Screen01Login';
import ComplianceMetadataFooter from '@/components/ComplianceMetadataFooter';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setScreen, isAuthenticated } = useAppStore();

  useEffect(() => {
    setScreen('login');
    if (isAuthenticated) {
      router.push('/');
    }
  }, [setScreen, isAuthenticated, router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0B2545' }}>
      {/* Top back bar */}
      <div style={{ padding: '12px 24px', background: '#061529', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <button
          type="button"
          onClick={() => {
            setScreen('landing');
            router.push('/');
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#D4AF37',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} /> Return to CompliScan AI Public Portal
        </button>

        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
          Official Legal Metrology Access Point (SIH 26034)
        </span>
      </div>

      <div style={{ flex: 1 }}>
        <Screen01Login />
      </div>

      <ComplianceMetadataFooter />
    </div>
  );
}
