'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import {
  X, LayoutDashboard, PlusCircle, History, BarChart3, Wifi, WifiOff,
  BookOpen, LogOut, Cloud, User, Shield, Settings
} from 'lucide-react';
import type { ScreenId } from '@/types/metrology';

export default function Screen15SideDrawer() {
  const {
    drawerOpen, toggleDrawer, currentInspector, setScreen,
    isOfflineMode, offlineQueue, logout,
  } = useAppStore();

  const navItems: { id: ScreenId; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-start', label: 'New Inspection', icon: PlusCircle },
    { id: 'history-table', label: 'Inspection History', icon: History },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'offline-sync', label: 'Offline Sync', icon: Cloud, badge: offlineQueue.length || undefined },
    { id: 'regulations', label: 'Regulations', icon: BookOpen },
  ];

  const handleNav = (screen: ScreenId) => {
    setScreen(screen);
  };

  if (!drawerOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={toggleDrawer}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 50,
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Drawer */}
      <div
        className="animate-slide-in-right"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '320px',
          height: '100%',
          background: 'var(--card-bg)',
          boxShadow: '-8px 0 24px rgba(0, 0, 0, 0.15)',
          zIndex: 51,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          background: 'var(--navy)',
          padding: '24px 20px',
          color: '#FFFFFF',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={20} color="#D4AF37" />
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#D4AF37' }}>CompliScan AI</span>
            </div>
            <button
              onClick={toggleDrawer}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} color="#fff" />
            </button>
          </div>

          {/* Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(212, 175, 55, 0.5)',
            }}>
              <User size={24} color="#D4AF37" />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700 }}>
                {currentInspector?.fullName || 'Inspector'}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                Badge #{currentInspector?.badgeNumber} • {currentInspector?.assignedDistrict}
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div style={{
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255,255,255,0.08)',
            width: 'fit-content',
            fontSize: '12px',
          }}>
            {isOfflineMode ? <WifiOff size={12} color="#F59E0B" /> : <Wifi size={12} color="#16A34A" />}
            <span>{isOfflineMode ? 'Offline' : 'Online'}</span>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', padding: '8px 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Navigation
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                transition: 'background 0.15s',
                marginBottom: '2px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--slate-bg)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <item.icon size={18} color="var(--text-secondary)" />
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{item.label}</span>
              </div>
              {item.badge && (
                <span style={{
                  background: 'var(--amber-warning)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '9999px',
                  minWidth: '20px',
                  textAlign: 'center',
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--card-border)' }}>
          <button
            onClick={logout}
            className="gov-btn gov-btn-outline"
            style={{
              width: '100%',
              color: 'var(--violation-red)',
              borderColor: 'rgba(220, 38, 38, 0.3)',
            }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </>
  );
}
