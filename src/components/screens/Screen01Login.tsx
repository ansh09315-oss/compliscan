'use client';

import React, { useState } from 'react';
import { useAppStore, DEFAULT_INSPECTOR } from '@/lib/store';
import { Shield, User, Lock, MapPin, Wifi, WifiOff, Fingerprint } from 'lucide-react';

export default function Screen01Login() {
  const { login, setOfflineMode, isOfflineMode } = useAppStore();
  const [officerId, setOfficerId] = useState('1045');
  const [password, setPassword] = useState('');
  const [district, setDistrict] = useState('Central Delhi');
  const [isLoading, setIsLoading] = useState(false);

  const districts = [
    'Central Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi',
    'New Delhi', 'North East Delhi', 'North West Delhi', 'South East Delhi',
    'South West Delhi', 'Shahdara',
  ];

  const handleLogin = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    login({ ...DEFAULT_INSPECTOR, badgeNumber: officerId, assignedDistrict: district });
  };

  const handleSSO = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    login(DEFAULT_INSPECTOR);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0B2545 0%, #13315C 50%, #134074 100%)',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        animation: 'fade-in-up 0.5s ease-out',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 16px',
            borderRadius: '50%',
            background: 'rgba(212, 175, 55, 0.15)',
            border: '2px solid #D4AF37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Shield size={40} color="#D4AF37" />
          </div>
          <h1 style={{ color: '#FFFFFF', fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>
            CompliScan AI
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
            Legal Metrology Compliance Inspection System
          </p>
          <p style={{ color: '#D4AF37', fontSize: '11px', marginTop: '4px', letterSpacing: '0.05em' }}>
            Ministry of Consumer Affairs, Food & Public Distribution
          </p>
        </div>

        {/* Card */}
        <div className="gov-card" style={{ padding: '32px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              <User size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
              Inspector Badge ID
            </label>
            <input
              className="gov-input"
              type="text"
              value={officerId}
              onChange={(e) => setOfficerId(e.target.value)}
              placeholder="Enter Badge Number"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              <Lock size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
              Password
            </label>
            <input
              className="gov-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              <MapPin size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
              Assigned District
            </label>
            <select
              className="gov-select"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            >
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <button
            className="gov-btn gov-btn-primary"
            style={{ width: '100%', marginBottom: '12px', padding: '12px' }}
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="animate-spin-slow" style={{ display: 'inline-block', width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
            ) : (
              <>
                <Lock size={16} /> Login
              </>
            )}
          </button>

          <button
            className="gov-btn gov-btn-outline"
            style={{ width: '100%', marginBottom: '16px', padding: '12px' }}
            onClick={handleSSO}
            disabled={isLoading}
          >
            <Fingerprint size={16} /> Login with SSO
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: isOfflineMode ? 'var(--amber-warning-bg)' : 'var(--slate-bg)',
            borderRadius: 'var(--radius-md)',
            transition: 'all 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isOfflineMode ? <WifiOff size={16} color="#B45309" /> : <Wifi size={16} color="var(--compliant-green)" />}
              <span style={{ fontSize: '13px', fontWeight: 600, color: isOfflineMode ? '#B45309' : 'var(--text-secondary)' }}>
                {isOfflineMode ? 'Offline Mode' : 'Online Mode'}
              </span>
            </div>
            <button
              onClick={() => setOfflineMode(!isOfflineMode)}
              style={{
                width: '44px',
                height: '24px',
                borderRadius: '12px',
                background: isOfflineMode ? '#F59E0B' : '#D1D5DB',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s',
              }}
            >
              <span style={{
                position: 'absolute',
                top: '2px',
                left: isOfflineMode ? '22px' : '2px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#FFFFFF',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                transition: 'left 0.2s',
              }} />
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '24px' }}>
          © 2026 Government of India — Legal Metrology Division
        </p>
      </div>
    </div>
  );
}
