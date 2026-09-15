'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { Menu, Shield, WifiOff } from 'lucide-react';

// Screen imports
import Screen01Login from '@/components/screens/Screen01Login';
import Screen02Dashboard from '@/components/screens/Screen02Dashboard';
import Screen03NewStart from '@/components/screens/Screen03NewStart';
import Screen04CameraHUD from '@/components/screens/Screen04CameraHUD';
import Screen05MultiAngle from '@/components/screens/Screen05MultiAngle';
import Screen06AIProcessing from '@/components/screens/Screen06AIProcessing';
import Screen07ExtractedReview from '@/components/screens/Screen07ExtractedReview';
import Screen08ComplianceGauge from '@/components/screens/Screen08ComplianceGauge';
import Screen09ViolationCards from '@/components/screens/Screen09ViolationCards';
import Screen10ReportDossier from '@/components/screens/Screen10ReportDossier';
import Screen11HistoryTable from '@/components/screens/Screen11HistoryTable';
import Screen12Analytics from '@/components/screens/Screen12Analytics';
import Screen13OfflineSync from '@/components/screens/Screen13OfflineSync';
import Screen14Regulations from '@/components/screens/Screen14Regulations';
import Screen15SideDrawer from '@/components/screens/Screen15SideDrawer';

const screenComponents: Record<string, React.ComponentType> = {
  'login': Screen01Login,
  'dashboard': Screen02Dashboard,
  'new-start': Screen03NewStart,
  'camera-hud': Screen04CameraHUD,
  'multi-angle': Screen05MultiAngle,
  'ai-processing': Screen06AIProcessing,
  'extracted-review': Screen07ExtractedReview,
  'compliance-gauge': Screen08ComplianceGauge,
  'violation-cards': Screen09ViolationCards,
  'report-dossier': Screen10ReportDossier,
  'history-table': Screen11HistoryTable,
  'analytics': Screen12Analytics,
  'offline-sync': Screen13OfflineSync,
  'regulations': Screen14Regulations,
};

export default function HomePage() {
  const { currentScreen, isAuthenticated, isOfflineMode, toggleDrawer, currentInspector } = useAppStore();

  const CurrentScreen = screenComponents[currentScreen] || Screen01Login;
  const showNavbar = isAuthenticated && currentScreen !== 'login' && currentScreen !== 'camera-hud' && currentScreen !== 'ai-processing';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Offline Banner */}
      {isOfflineMode && isAuthenticated && (
        <div className="offline-banner">
          <WifiOff size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '6px' }} />
          Offline Mode — Data will be stored locally and synced when reconnected
        </div>
      )}

      {/* Navbar */}
      {showNavbar && (
        <nav className="gov-navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/assets/emblem.svg" alt="Emblem" style={{ width: '32px', height: '32px' }} />
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={14} color="#D4AF37" />
                CompliScan AI
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>
                Legal Metrology Division
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>
                {currentInspector?.fullName}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                Badge #{currentInspector?.badgeNumber}
              </div>
            </div>
            <button
              onClick={toggleDrawer}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            >
              <Menu size={20} color="#fff" />
            </button>
          </div>
        </nav>
      )}

      {/* Screen Content */}
      <main style={{ flex: 1, background: currentScreen === 'login' || currentScreen === 'ai-processing' || currentScreen === 'camera-hud' ? 'transparent' : 'var(--slate-bg)' }}>
        <CurrentScreen />
      </main>

      {/* Side Drawer */}
      <Screen15SideDrawer />
    </div>
  );
}
