'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { Camera, Upload, FileText, ArrowLeft } from 'lucide-react';

export default function Screen03NewStart() {
  const { setScreen, setCaptureMode, resetInspection } = useAppStore();

  const handleSelect = (mode: 'camera' | 'upload' | 'manual') => {
    resetInspection();
    setCaptureMode(mode);
    if (mode === 'camera') {
      setScreen('camera-hud');
    } else if (mode === 'upload') {
      setScreen('multi-angle');
    } else {
      setScreen('extracted-review');
    }
  };

  const modes = [
    {
      id: 'camera' as const,
      icon: Camera,
      title: 'Scan Product',
      desc: 'Use device camera to capture packaging labels in real-time with alignment guides',
      color: 'var(--primary-blue)',
      bg: '#DBEAFE',
      badge: null,
    },
    {
      id: 'upload' as const,
      icon: Upload,
      title: 'Upload Images',
      desc: 'Select existing photos of packaging from device gallery for multi-angle analysis',
      color: '#2563eb',
      bg: 'rgba(37, 99, 235, 0.1)',
      badge: null,
    },
    {
      id: 'manual' as const,
      icon: FileText,
      title: 'Enter Details Manually',
      desc: 'Input product declaration data directly for compliance evaluation without images',
      color: '#7C3AED',
      bg: '#EDE9FE',
      badge: null,
    },
  ];

  return (
    <div className="screen-container" style={{ animation: 'fade-in-up 0.4s ease-out' }}>
      <button
        className="gov-btn gov-btn-ghost"
        onClick={() => setScreen('dashboard')}
        style={{ marginBottom: '16px' }}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
        New Inspection
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Select how you would like to capture the packaged commodity for compliance analysis
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        maxWidth: '960px',
      }}>
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => handleSelect(mode.id)}
            className="gov-card"
            style={{
              padding: '32px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              border: '2px solid transparent',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = mode.color;
              (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${mode.color}22`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
              (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: mode.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s',
              position: 'relative',
            }}>
              {mode.id === 'sample' && isLoadingSample ? (
                <RefreshCw size={32} color={mode.color} className="spin" />
              ) : (
                <mode.icon size={32} color={mode.color} />
              )}
            </div>
            {mode.badge && (
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: mode.color,
                background: mode.bg,
                padding: '3px 10px',
                borderRadius: '12px',
                letterSpacing: '0.3px',
              }}>
                {mode.badge}
              </span>
            )}
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {mode.id === 'sample' && isLoadingSample ? 'Loading 4 Photos...' : mode.title}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              {mode.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
