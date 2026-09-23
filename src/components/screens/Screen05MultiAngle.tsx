'use client';

import React, { useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { computeSHA256FromBlob } from '@/lib/cryptoUtils';
import { ArrowLeft, Camera, RotateCcw, CheckCircle, Image as ImageIcon, ChevronRight, Trash2 } from 'lucide-react';
import type { AngleType } from '@/types/metrology';

const REQUIRED_ANGLES: { type: AngleType; label: string; required: boolean }[] = [
  { type: 'FRONT', label: 'Front Label', required: true },
  { type: 'BACK', label: 'Back Panel', required: true },
  { type: 'REGULATORY_SIDE', label: 'Regulatory Side', required: true },
  { type: 'MRP_BATCH', label: 'MRP & Batch', required: true },
  { type: 'ADDITIONAL', label: 'Additional Info', required: false },
];

export default function Screen05MultiAngle() {
  const { capturedAngles, addCapturedAngle, removeCapturedAngle, clearCaptures, setScreen } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeAngleRef = useRef<AngleType>('FRONT');

  const requiredCount = REQUIRED_ANGLES.filter((a) => a.required).length;
  const capturedCount = capturedAngles.length;
  const allRequiredCaptured = capturedCount > 0;

  const handleUpload = (angleType: AngleType) => {
    activeAngleRef.current = angleType;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const blob = new Blob([await file.arrayBuffer()]);
      const hash = await computeSHA256FromBlob(blob);

      const img = new window.Image();
      img.onload = () => {
        addCapturedAngle({
          angleType: activeAngleRef.current,
          imageDataUrl: dataUrl,
          sha256Hash: hash,
          opticalWidth: img.width,
          opticalHeight: img.height,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
      e.target.value = '';
  };

  const getAngleImage = (type: AngleType) =>
    capturedAngles.find((a) => a.angleType === type);

  return (
    <div className="screen-container" style={{ animation: 'fade-in-up 0.4s ease-out' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <button className="gov-btn gov-btn-ghost" onClick={() => setScreen('new-start')} style={{ marginBottom: '16px' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Multi-Angle Capture</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Capture or upload images from all required angles for comprehensive Legal Metrology analysis
          </p>
        </div>
        {capturedCount > 0 && (
          <button
            type="button"
            className="gov-btn gov-btn-outline"
            style={{ fontSize: '12px', padding: '6px 14px', color: 'var(--violation-red)', borderColor: 'var(--violation-red)' }}
            onClick={clearCaptures}
          >
            <Trash2 size={14} /> Clear All
          </button>
        )}
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{
          flex: 1,
          height: '8px',
          background: 'var(--card-border)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${Math.min(100, (capturedCount / requiredCount) * 100)}%`,
            height: '100%',
            background: allRequiredCaptured ? 'var(--compliant-green)' : 'var(--primary-blue)',
            borderRadius: '4px',
            transition: 'width 0.4s ease',
          }} />
        </div>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {capturedCount}/{requiredCount} Panels
        </span>
      </div>

      {/* Angle Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {REQUIRED_ANGLES.map((angle) => {
          const captured = getAngleImage(angle.type);
          return (
            <div
              key={angle.type}
              className="gov-card"
              style={{
                padding: '16px',
                border: captured ? '2px solid var(--compliant-green)' : '2px dashed var(--card-border)',
                textAlign: 'center',
              }}
            >
              {captured ? (
                <>
                  <div style={{
                    width: '100%',
                    aspectRatio: '4/3',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    marginBottom: '12px',
                    background: '#f1f5f9',
                  }}>
                    <img
                      src={captured.imageDataUrl}
                      alt={angle.label}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
                    <CheckCircle size={16} color="var(--compliant-green)" />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--compliant-green)' }}>
                      {angle.label}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '8px' }}>
                    SHA: {captured.sha256Hash.substring(0, 16)}...
                  </p>
                  <button
                    className="gov-btn gov-btn-outline"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                    onClick={() => {
                      removeCapturedAngle(angle.type);
                      handleUpload(angle.type);
                    }}
                  >
                    <RotateCcw size={12} /> Retake
                  </button>
                </>
              ) : (
                <>
                  <div style={{
                    width: '100%',
                    aspectRatio: '4/3',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--slate-bg)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                    gap: '8px',
                    color: 'var(--text-muted)',
                  }}>
                    <ImageIcon size={32} />
                    <span style={{ fontSize: '12px' }}>No image</span>
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{angle.label}</p>
                  <p style={{ fontSize: '12px', color: angle.required ? 'var(--violation-red)' : 'var(--text-muted)', marginBottom: '12px' }}>
                    {angle.required ? 'Required' : 'Optional'}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button
                      className="gov-btn gov-btn-primary"
                      style={{ fontSize: '12px', padding: '8px 14px' }}
                      onClick={() => handleUpload(angle.type)}
                    >
                      <Camera size={14} /> Upload
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Proceed Button */}
      <div style={{ textAlign: 'center', marginTop: '12px' }}>
        <div>
          <button
            id="btn-proceed-ai-analysis"
            className={`gov-btn ${allRequiredCaptured ? 'gov-btn-primary' : 'gov-btn-outline'}`}
            style={{
              padding: '14px 36px',
              fontSize: '16px',
              fontWeight: 700,
              opacity: allRequiredCaptured ? 1 : 0.5,
              borderRadius: '8px',
              boxShadow: allRequiredCaptured ? '0 6px 20px rgba(37, 99, 235, 0.35)' : 'none',
              cursor: allRequiredCaptured ? 'pointer' : 'not-allowed',
            }}
            disabled={!allRequiredCaptured}
            onClick={() => setScreen('ai-processing')}
          >
            Run Legal Metrology Inspection <ChevronRight size={18} />
          </button>
        </div>

        {!allRequiredCaptured ? (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Upload at least 1 packaging image to proceed
          </p>
        ) : (
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            Ready for AI analysis ({capturedCount} packaging panels attached)
          </p>
        )}
      </div>
    </div>
  );
}
