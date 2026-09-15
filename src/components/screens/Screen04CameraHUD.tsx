'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { computeSHA256FromBlob } from '@/lib/cryptoUtils';
import { ArrowLeft, Zap, ZapOff, Camera as CameraIcon, CheckCircle, Sun, Focus, Smartphone } from 'lucide-react';

export default function Screen04CameraHUD() {
  const { setScreen, addCapturedAngle } = useAppStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [flashOn, setFlashOn] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const [quality, setQuality] = useState({ lighting: true, stable: true, focus: true });

  useEffect(() => {
    startCamera();
    return () => { stream?.getTracks().forEach((t) => t.stop()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch {
      // Camera not available — fallback to upload
      console.warn('Camera not available, using fallback');
    }
  };

  // Simulate quality indicator fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setQuality({
        lighting: Math.random() > 0.15,
        stable: Math.random() > 0.1,
        focus: Math.random() > 0.12,
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const captureFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    setIsCaptured(true);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const hash = await computeSHA256FromBlob(blob);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

      addCapturedAngle({
        angleType: 'FRONT',
        imageDataUrl: dataUrl,
        sha256Hash: hash,
        opticalWidth: canvas.width,
        opticalHeight: canvas.height,
      });

      setTimeout(() => {
        stream?.getTracks().forEach((t) => t.stop());
        setScreen('multi-angle');
      }, 800);
    }, 'image/jpeg', 0.9);
  }, [addCapturedAngle, setScreen, stream]);

  const qualityBadges = [
    { label: 'Lighting', ok: quality.lighting, icon: Sun },
    { label: 'Stable', ok: quality.stable, icon: Smartphone },
    { label: 'Focus', ok: quality.focus, icon: Focus },
  ];

  return (
    <div style={{
      position: 'relative',
      height: '100vh',
      background: '#000',
      overflow: 'hidden',
    }}>
      {/* Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Overlay Reticle */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '75%',
        maxWidth: '500px',
        aspectRatio: '4/3',
        border: `3px solid ${isCaptured ? 'var(--compliant-green)' : 'rgba(255,255,255,0.6)'}`,
        borderRadius: '12px',
        transition: 'border-color 0.3s',
        pointerEvents: 'none',
      }}>
        {/* Corner markers */}
        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => (
          <div key={pos} style={{
            position: 'absolute',
            width: '24px',
            height: '24px',
            ...(pos.includes('top') ? { top: '-2px' } : { bottom: '-2px' }),
            ...(pos.includes('left') ? { left: '-2px' } : { right: '-2px' }),
            borderTop: pos.includes('top') ? '4px solid #D4AF37' : 'none',
            borderBottom: pos.includes('bottom') ? '4px solid #D4AF37' : 'none',
            borderLeft: pos.includes('left') ? '4px solid #D4AF37' : 'none',
            borderRight: pos.includes('right') ? '4px solid #D4AF37' : 'none',
          }} />
        ))}
        <div style={{
          position: 'absolute',
          bottom: '-36px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.8)',
          fontSize: '13px',
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}>
          Align product label within frame
        </div>
      </div>

      {/* Top Bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)',
      }}>
        <button
          onClick={() => { stream?.getTracks().forEach((t) => t.stop()); setScreen('new-start'); }}
          style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <ArrowLeft size={20} color="#fff" />
        </button>
        <div style={{ display: 'flex', gap: '8px' }}>
          {qualityBadges.map((b, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '9999px',
              background: b.ok ? 'rgba(22, 163, 74, 0.3)' : 'rgba(220, 38, 38, 0.3)',
              backdropFilter: 'blur(8px)',
              fontSize: '11px',
              fontWeight: 600,
              color: '#fff',
            }}>
              <b.icon size={12} />
              {b.label}
            </div>
          ))}
        </div>
        <button
          onClick={() => setFlashOn(!flashOn)}
          style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          {flashOn ? <Zap size={20} color="#F59E0B" /> : <ZapOff size={20} color="#fff" />}
        </button>
      </div>

      {/* Capture Button */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
      }}>
        <button
          onClick={captureFrame}
          disabled={isCaptured}
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: isCaptured ? 'var(--compliant-green)' : '#FFFFFF',
            border: `4px solid ${isCaptured ? 'var(--compliant-green)' : 'rgba(255,255,255,0.5)'}`,
            cursor: isCaptured ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          {isCaptured ? (
            <CheckCircle size={32} color="#fff" />
          ) : (
            <CameraIcon size={28} color="#0B2545" />
          )}
        </button>
      </div>

      {/* Captured Flash Effect */}
      {isCaptured && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: '#fff',
          opacity: 0,
          animation: 'flash 0.3s ease-out',
          pointerEvents: 'none',
        }} />
      )}

      <style>{`
        @keyframes flash {
          0% { opacity: 0.8; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
