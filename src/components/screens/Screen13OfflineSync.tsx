'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { ArrowLeft, Wifi, WifiOff, RefreshCw, CheckCircle, Clock, AlertCircle, Cloud } from 'lucide-react';

export default function Screen13OfflineSync() {
  const { setScreen, offlineQueue, removeFromOfflineQueue, clearOfflineQueue, isOfflineMode } = useAppStore();
  const [syncing, setSyncing] = useState(false);
  const [syncedItems, setSyncedItems] = useState<string[]>([]);

  const handleSync = async () => {
    setSyncing(true);
    for (const item of offlineQueue) {
      await new Promise((r) => setTimeout(r, 1200));
      setSyncedItems((prev) => [...prev, item.id]);
      removeFromOfflineQueue(item.id);
    }
    setSyncing(false);
  };

  const demoQueue = offlineQueue.length > 0 ? offlineQueue : [
    { id: 'q1', dossier: { dossierReferenceCode: 'LM-2026-PENDING1', productName: 'Amul Butter' } as any, queuedAt: '2026-09-15T10:00:00Z', retryCount: 0, status: 'pending' as const },
    { id: 'q2', dossier: { dossierReferenceCode: 'LM-2026-PENDING2', productName: 'Bournvita Health Drink' } as any, queuedAt: '2026-09-15T11:30:00Z', retryCount: 1, status: 'pending' as const },
  ];

  return (
    <div className="screen-container" style={{ animation: 'fade-in-up 0.4s ease-out' }}>
      <button className="gov-btn gov-btn-ghost" onClick={() => setScreen('dashboard')} style={{ marginBottom: '16px' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Offline Data Sync</h1>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
        Manage pending inspection dossiers and synchronize with central database
      </p>

      {/* Status Card */}
      <div className="gov-card" style={{
        padding: '20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: `2px solid ${isOfflineMode ? 'var(--amber-warning)' : 'var(--compliant-green)'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isOfflineMode ? (
            <WifiOff size={24} color="var(--amber-warning)" />
          ) : (
            <Wifi size={24} color="var(--compliant-green)" />
          )}
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>
              {isOfflineMode ? 'Offline Mode Active' : 'Connected to Network'}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {demoQueue.length} dossier{demoQueue.length !== 1 ? 's' : ''} pending synchronization
            </div>
          </div>
        </div>
        <button
          className="gov-btn gov-btn-primary"
          onClick={handleSync}
          disabled={syncing || demoQueue.length === 0}
          style={{ padding: '10px 24px' }}
        >
          {syncing ? (
            <><RefreshCw size={16} className="animate-spin-slow" /> Syncing...</>
          ) : (
            <><Cloud size={16} /> Sync Now</>
          )}
        </button>
      </div>

      {/* Queue */}
      <div className="gov-card" style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--card-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700 }}>Pending Queue</h3>
          {demoQueue.length > 0 && (
            <span className="badge badge-amber">{demoQueue.length} pending</span>
          )}
        </div>

        {demoQueue.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle size={48} style={{ margin: '0 auto 12px' }} color="var(--compliant-green)" />
            <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--compliant-green)' }}>All Synced!</p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>No pending dossiers in the queue</p>
          </div>
        ) : (
          <div>
            {demoQueue.map((item, i) => {
              const isSynced = syncedItems.includes(item.id);
              return (
                <div
                  key={item.id}
                  style={{
                    padding: '16px 20px',
                    borderBottom: i < demoQueue.length - 1 ? '1px solid var(--card-border)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: isSynced ? 'rgba(22, 163, 74, 0.04)' : 'transparent',
                    transition: 'background 0.3s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isSynced ? (
                      <CheckCircle size={20} color="var(--compliant-green)" />
                    ) : syncing ? (
                      <RefreshCw size={20} color="var(--primary-blue)" className="animate-spin-slow" />
                    ) : (
                      <Clock size={20} color="var(--amber-warning)" />
                    )}
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>
                        {item.dossier.dossierReferenceCode}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {item.dossier.productName} • Queued {new Date(item.queuedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <span className={`badge ${isSynced ? 'badge-green' : 'badge-amber'}`}>
                    {isSynced ? 'Synced' : `Attempt #${item.retryCount + 1}`}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
