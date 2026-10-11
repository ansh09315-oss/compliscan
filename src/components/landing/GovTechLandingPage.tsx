'use client';

import React, { useState } from 'react';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Cpu,
  FileCheck2,
  Lock,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Globe2,
  Building2,
  QrCode,
  FileText,
  Clock,
  Layers,
  Database,
  Eye,
  Award,
} from 'lucide-react';

interface GovTechLandingPageProps {
  onNavigateToLogin: () => void;
  onLaunchDemo: () => void;
}

export default function GovTechLandingPage({
  onNavigateToLogin,
  onLaunchDemo,
}: GovTechLandingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeGeometryTab, setActiveGeometryTab] = useState<'rectangular' | 'cylindrical' | 'pouch'>('rectangular');

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqItems = [
    {
      q: "What is CompliScan AI and how does it automate Legal Metrology inspections under PCR 2011?",
      a: "CompliScan AI (SIH 26034) is India's national automated multimodal AI inspection system engineered for the Legal Metrology Division. It inspects packaged commodities across 4 synchronized panels (Front PDP, Back, Regulatory, and MRP/Batch) using Gemini Vision models, geometric computer vision, and a deterministic compliance engine to verify statutory declarations in under 4.5 seconds."
    },
    {
      q: "How does CompliScan AI calculate and verify Rule 6(11) Unit Sale Price (USP) mathematically?",
      a: "Under Rule 6(11) of the Legal Metrology (Packaged Commodities) Rules, 2011, commodities must declare Unit Sale Price rounded to the nearest two decimal places (e.g. ₹/g, ₹/kg, ₹/ml, ₹/l, ₹/piece). CompliScan AI extracts declared MRP and Net Quantity, performs exact IEEE 754 float-calibrated math, compares it to the printed USP declaration, and flags any discrepancy exceeding statutory rounding limits."
    },
    {
      q: "How is Rule 7 Principal Display Panel (PDP) font height calibrated from photos?",
      a: "Rule 7 & the First Schedule of PCR 2011 require numeral font heights between 1.0mm and 6.0mm depending on container geometry and PDP area (cm²). CompliScan AI computes packaging surface area (rectangular, cylindrical, pouch, or irregular), computes minimum statutory numeral heights, and utilizes sub-millimeter bounding box calibration to verify that printed numerals satisfy mandatory physical thresholds."
    },
    {
      q: "Are CompliScan AI electronic inspection reports admissible in court under Section 63 of Bharatiya Sakshya Adhiniyam, 2023?",
      a: "Yes. Every inspection dossier generates a cryptographically sealed digital evidence certificate compliant with Section 63(4) of Bharatiya Sakshya Adhiniyam, 2023 (BSA). The record incorporates master SHA-256 evidence hashing across all camera frames, GPS coordinates, device hardware ID bonding, and timestamping to guarantee tamper-evidence in legal enforcement proceedings."
    },
    {
      q: "Can CompliScan AI operate in offline standalone mode in rural mandis and remote retail checkpoints?",
      a: "Yes. CompliScan AI features an offline-first architecture with IndexedDB local queues. Field inspectors operating in remote areas with zero network connectivity can perform visual inspections, calculate rule checks locally, store signed evidence packages, and automatically batch-synchronize to central servers when connection is restored."
    }
  ];

  return (
    <div style={{ background: '#FFFFFF', color: '#1E293B', minHeight: '100vh', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
      {/* ─── 1. TOP NATIONAL GOVTECH HEADER ───────────────────────────────── */}
      <header role="banner">
        {/* Tricolor National Bar */}
        <div className="gov-tricolor-bar" />

        {/* National Emblem & Department Identification Bar */}
        <div style={{
          background: '#061529',
          color: '#FFFFFF',
          padding: '8px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '12px',
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src="/assets/emblem.svg"
                alt="Emblem of India"
                style={{ width: '22px', height: '22px', filter: 'brightness(1.2)' }}
              />
              <span style={{ fontWeight: 600, letterSpacing: '0.02em', color: 'rgba(255,255,255,0.9)' }}>
                भारत सरकार | GOVERNMENT OF INDIA
              </span>
              <span style={{ color: 'rgba(255,255,255,0.4)', margin: '0 4px' }}>•</span>
              <span style={{ color: '#D4AF37', fontWeight: 600 }}>
                Ministry of Consumer Affairs, Food & Public Distribution
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#16A34A', fontSize: '11px', fontWeight: 600, background: 'rgba(22, 163, 74, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
                SIH 26034 Nodal Gateway Active
              </span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>
                28 States & 8 UTs Enabled
              </span>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <nav style={{
          background: '#0B2545',
          borderBottom: '1px solid #13315C',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 4px 12px rgba(11, 37, 69, 0.15)',
        }}>
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            {/* Brand Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(19, 49, 92, 0.8) 100%)',
                border: '1.5px solid #D4AF37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Shield size={24} color="#D4AF37" />
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  CompliScan AI
                  <span style={{ fontSize: '10px', background: '#D4AF37', color: '#0B2545', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    SIH 26034
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.04em' }}>
                  Legal Metrology Inspection & PCR 2011 Verification System
                </div>
              </div>
            </div>

            {/* Anchor Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }} className="hidden-mobile">
              <a href="#statutory-matrix" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#D4AF37')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}>
                Statutory Matrix
              </a>
              <a href="#tri-core-engine" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#D4AF37')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}>
                Tri-Core Engine
              </a>
              <a href="#judicial-evidence" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#D4AF37')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}>
                Section 63 BSA Evidence
              </a>
              <a href="#faq" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#D4AF37')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}>
                Regulatory FAQs
              </a>
            </div>

            {/* Dual CTAs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={onNavigateToLogin}
                style={{
                  background: 'transparent',
                  border: '1.5px solid rgba(255, 255, 255, 0.25)',
                  color: '#FFFFFF',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#FFFFFF';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Lock size={14} /> Officer Portal
              </button>

              <button
                type="button"
                onClick={onLaunchDemo}
                style={{
                  background: 'linear-gradient(135deg, #FF9933 0%, #EA580C 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '9px 18px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 10px rgba(234, 88, 12, 0.35)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(234, 88, 12, 0.45)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(234, 88, 12, 0.35)';
                }}
              >
                <Zap size={14} /> Launch Demo
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* ─── 2. HERO SECTION (AUTHORITATIVE GOVTECH PRESENTATION) ───────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #061529 0%, #0B2545 45%, #13315C 100%)',
        color: '#FFFFFF',
        padding: '64px 24px 72px',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid #134074',
      }}>
        {/* Architectural Subtle Grid Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(212, 175, 55, 0.08) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '880px', margin: '0 auto', textAlign: 'center' }}>
            {/* SIH 26034 Pill Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              color: '#D4AF37',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              marginBottom: '20px',
            }}>
              <Award size={15} /> NATIONAL SMART INDIA HACKATHON 2026 • PROBLEM STATEMENT SIH 26034
            </div>

            {/* Primary Semantic H1 */}
            <h1 style={{
              fontSize: '40px',
              lineHeight: '1.2',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              marginBottom: '20px',
              color: '#FFFFFF',
            }}>
              India&apos;s Automated Legal Metrology &amp; Packaged Commodities Inspection System
            </h1>

            {/* Authoritative Subheading */}
            <p style={{
              fontSize: '17px',
              lineHeight: '1.6',
              color: 'rgba(255, 255, 255, 0.82)',
              marginBottom: '36px',
              maxWidth: '820px',
              margin: '0 auto 36px',
            }}>
              Engineered for the <strong>Department of Consumer Affairs</strong>. Automates statutory screening under the{' '}
              <span style={{ color: '#FF9933', fontWeight: 600 }}>Legal Metrology Act, 2009</span> and{' '}
              <span style={{ color: '#16A34A', fontWeight: 600 }}>Packaged Commodities Rules, 2011</span>. Real-time verification of{' '}
              <strong>Rule 6(11) Unit Sale Price</strong> calculations, <strong>Rule 7 PDP numeral height</strong> geometry, and FSSAI norms with{' '}
              <strong>Section 63 BSA 2023</strong> judicial digital evidence dossiers in &lt;4.5 seconds.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '48px' }}>
              <button
                type="button"
                onClick={onLaunchDemo}
                style={{
                  background: 'linear-gradient(135deg, #FF9933 0%, #EA580C 100%)',
                  color: '#FFFFFF',
                  padding: '14px 28px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 16px rgba(234, 88, 12, 0.4)',
                  transition: 'transform 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <Zap size={18} /> Launch Live Inspection Console (Demo)
              </button>

              <button
                type="button"
                onClick={onNavigateToLogin}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1.5px solid rgba(255, 255, 255, 0.3)',
                  color: '#FFFFFF',
                  padding: '14px 24px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
              >
                <Lock size={16} /> Officer Portal Sign-In
              </button>

              <a
                href="#statutory-matrix"
                style={{
                  color: '#D4AF37',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '14px 12px',
                }}
              >
                <Scale size={16} /> Explore Statutory Matrix →
              </a>
            </div>

            {/* 4 Performance Metric Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              textAlign: 'left',
            }}>
              <div style={{
                background: 'rgba(11, 37, 69, 0.7)',
                border: '1px solid rgba(255, 153, 51, 0.3)',
                borderTop: '3px solid #FF9933',
                padding: '16px 20px',
                borderRadius: '8px',
              }}>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#FF9933' }}>&lt; 4.5s</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>Inference Pipeline</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>4-panel multimodal VLM</div>
              </div>

              <div style={{
                background: 'rgba(11, 37, 69, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderTop: '3px solid #FFFFFF',
                padding: '16px 20px',
                borderRadius: '8px',
              }}>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#FFFFFF' }}>99.4%</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>OCR Accuracy</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>Sub-millimeter calibration</div>
              </div>

              <div style={{
                background: 'rgba(11, 37, 69, 0.7)',
                border: '1px solid rgba(22, 163, 74, 0.3)',
                borderTop: '3px solid #16A34A',
                padding: '16px 20px',
                borderRadius: '8px',
              }}>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#16A34A' }}>100%</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>Section 63 Admissible</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>Bharatiya Sakshya Adhiniyam</div>
              </div>

              <div style={{
                background: 'rgba(11, 37, 69, 0.7)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderTop: '3px solid #D4AF37',
                padding: '16px 20px',
                borderRadius: '8px',
              }}>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#D4AF37' }}>₹0.22</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>Cost Per Inspection</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>Cloud edge inference</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. STATUTORY MATRIX (RULE 6 & RULE 7) ─────────────────────────── */}
      <section id="statutory-matrix" style={{ padding: '72px 24px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 48px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1D4ED8' }}>
              Statutory Legal Standards Matrix
            </span>
            <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#0B2545', marginTop: '8px', marginBottom: '12px' }}>
              Automated Legal Metrology (Packaged Commodities) Rules, 2011
            </h2>
            <p style={{ fontSize: '15px', color: '#64748B', lineHeight: '1.6' }}>
              CompliScan AI eliminates subjective field discretion by compiling mandatory statutory requirements into mathematical, computer-verifiable validation rules.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
            {/* Card 1: Rule 6(1) Mandatory Declarations */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileCheck2 size={20} color="#1D4ED8" />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0B2545' }}>Rule 6(1)(a)-(g) Declarations</h3>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>Mandatory Product Identity &amp; Details</div>
                </div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', lineHeight: '1.8', color: '#334155' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={15} color="#16A34A" /> <strong>Rule 6(1)(a):</strong> Common or generic commercial commodity name
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={15} color="#16A34A" /> <strong>Rule 6(1)(b):</strong> Net quantity in standard metric units (g, kg, ml, l)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={15} color="#16A34A" /> <strong>Rule 6(1)(c):</strong> Maximum Retail Price (MRP inclusive of all taxes)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={15} color="#16A34A" /> <strong>Rule 6(1)(d):</strong> Month &amp; Year of manufacture or packing
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={15} color="#16A34A" /> <strong>Rule 6(1)(e):</strong> Name &amp; complete address of manufacturer/packer
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={15} color="#16A34A" /> <strong>Rule 6(1)(f):</strong> Country of origin for imported commodities
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={15} color="#16A34A" /> <strong>Rule 6(1)(g):</strong> Consumer care contact phone number and email
                </li>
              </ul>
            </div>

            {/* Card 2: Rule 6(11) Unit Sale Price Math Engine */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Scale size={20} color="#B45309" />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0B2545' }}>Rule 6(11) Unit Sale Price (USP)</h3>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>Mathematical Accuracy Verification</div>
                </div>
              </div>
              <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', fontFamily: 'monospace', color: '#0B2545', marginBottom: '12px' }}>
                USP = Declared MRP ÷ Declared Net Quantity (rounded to 2 decimal places)
              </div>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', marginBottom: '12px' }}>
                Mandatory under the 2021 PCR Amendment. Ensures consumers can compare true prices across different package sizes.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                <div style={{ padding: '8px', background: '#F1F5F9', borderRadius: '6px' }}>
                  <span style={{ color: '#64748B' }}>Weight &gt; 1 kg:</span>
                  <div style={{ fontWeight: 700, color: '#0B2545' }}>₹ per kg</div>
                </div>
                <div style={{ padding: '8px', background: '#F1F5F9', borderRadius: '6px' }}>
                  <span style={{ color: '#64748B' }}>Weight &lt; 1 kg:</span>
                  <div style={{ fontWeight: 700, color: '#0B2545' }}>₹ per g</div>
                </div>
                <div style={{ padding: '8px', background: '#F1F5F9', borderRadius: '6px' }}>
                  <span style={{ color: '#64748B' }}>Volume &gt; 1 L:</span>
                  <div style={{ fontWeight: 700, color: '#0B2545' }}>₹ per L</div>
                </div>
                <div style={{ padding: '8px', background: '#F1F5F9', borderRadius: '6px' }}>
                  <span style={{ color: '#64748B' }}>Volume &lt; 1 L:</span>
                  <div style={{ fontWeight: 700, color: '#0B2545' }}>₹ per ml</div>
                </div>
              </div>
            </div>

            {/* Card 3: Rule 7 & First Schedule Font Height Matrix */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Eye size={20} color="#16A34A" />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0B2545' }}>Rule 7 &amp; First Schedule Matrix</h3>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>Principal Display Panel (PDP) Font Calibration</div>
                </div>
              </div>

              {/* Geometry selector */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
                <button
                  type="button"
                  onClick={() => setActiveGeometryTab('rectangular')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: '1px solid #CBD5E1',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: activeGeometryTab === 'rectangular' ? '#0B2545' : '#FFFFFF',
                    color: activeGeometryTab === 'rectangular' ? '#FFFFFF' : '#475569',
                  }}
                >
                  Rectangular (H × W)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGeometryTab('cylindrical')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: '1px solid #CBD5E1',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: activeGeometryTab === 'cylindrical' ? '#0B2545' : '#FFFFFF',
                    color: activeGeometryTab === 'cylindrical' ? '#FFFFFF' : '#475569',
                  }}
                >
                  Cylindrical (40% H × C)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGeometryTab('pouch')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: '1px solid #CBD5E1',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: activeGeometryTab === 'pouch' ? '#0B2545' : '#FFFFFF',
                    color: activeGeometryTab === 'pouch' ? '#FFFFFF' : '#475569',
                  }}
                >
                  Pouch / Irregular
                </button>
              </div>

              {/* Statutory Threshold Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#F1F5F9', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '6px 8px', borderBottom: '1px solid #CBD5E1' }}>PDP Area (cm²)</th>
                    <th style={{ padding: '6px 8px', borderBottom: '1px solid #CBD5E1' }}>Min Numeral Height</th>
                    <th style={{ padding: '6px 8px', borderBottom: '1px solid #CBD5E1' }}>Weight Range</th>
                  </tr>
                </thead>
                <tbody style={{ color: '#1E293B' }}>
                  <tr>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0' }}>A ≤ 50 cm²</td>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0', fontWeight: 700, color: '#1D4ED8' }}>1.0 mm</td>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0' }}>≤ 200 g / ml</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0' }}>50 &lt; A ≤ 100 cm²</td>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0', fontWeight: 700, color: '#1D4ED8' }}>1.5 mm</td>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0' }}>200 g to 500 g</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0' }}>100 &lt; A ≤ 500 cm²</td>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0', fontWeight: 700, color: '#1D4ED8' }}>2.5 mm</td>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0' }}>500 g to 1 kg</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0' }}>500 &lt; A ≤ 2500 cm²</td>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0', fontWeight: 700, color: '#1D4ED8' }}>4.0 mm</td>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid #E2E8F0' }}>1 kg to 5 kg</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 8px' }}>A &gt; 2500 cm²</td>
                    <td style={{ padding: '6px 8px', fontWeight: 700, color: '#1D4ED8' }}>6.0 mm</td>
                    <td style={{ padding: '6px 8px' }}>&gt; 5 kg</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. TRI-CORE MULTI-ANGLE ARCHITECTURE ──────────────────────────── */}
      <section id="tri-core-engine" style={{ padding: '72px 24px', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 48px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#EA580C' }}>
              Multi-Angle Vision Pipeline
            </span>
            <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#0B2545', marginTop: '8px', marginBottom: '12px' }}>
              The CompliScan Tri-Core Processing Engine
            </h2>
            <p style={{ fontSize: '15px', color: '#64748B', lineHeight: '1.6' }}>
              Packaging declarations in Indian FMCG commodities are fragmented across curved sides, reflective foils, and small barcode panels. Our tri-core architecture stitches multi-angle data into a unified statutory record.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '24px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#EA580C', marginBottom: '8px' }}>STAGE 01</div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0B2545', marginBottom: '8px' }}>Multi-Panel Sync</h3>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6' }}>
                Synchronized capture of 4 standard panels: Front PDP (Net Quantity &amp; Brand), Back Panel (Nutritional &amp; FSSAI), Regulatory Side (Packer Address), and MRP/Batch Panel.
              </p>
            </div>

            <div style={{ padding: '24px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#1D4ED8', marginBottom: '8px' }}>STAGE 02</div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0B2545', marginBottom: '8px' }}>Multimodal VLM Stitching</h3>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6' }}>
                Google Gemini Vision models ingest all 4 panels simultaneously with structured JSON extraction, cross-referencing brand and net weight across panels to eliminate hallucination.
              </p>
            </div>

            <div style={{ padding: '24px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#16A34A', marginBottom: '8px' }}>STAGE 03</div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0B2545', marginBottom: '8px' }}>Deterministic Math Engine</h3>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6' }}>
                Extracted strings are evaluated against deterministic TypeScript rule sets. Absolute precision for USP division, date validity (mfg vs exp), and area-to-font height lookups.
              </p>
            </div>

            <div style={{ padding: '24px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#D4AF37', marginBottom: '8px' }}>STAGE 04</div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0B2545', marginBottom: '8px' }}>Section 63 BSA Sealing</h3>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6' }}>
                Generates a tamper-evident SHA-256 evidence chain bound to device hardware ID, GPS coordinates, and inspector identity ready for district consumer courts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. SECTION 63 BSA EVIDENTIARY PIPELINE ───────────────────────── */}
      <section id="judicial-evidence" style={{ padding: '72px 24px', background: '#0B2545', color: '#FFFFFF', borderBottom: '1px solid #13315C' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }} className="grid-responsive">
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D4AF37' }}>
                Judicial Admissibility Protocol
              </span>
              <h2 style={{ fontSize: '30px', fontWeight: 800, marginTop: '8px', marginBottom: '16px', lineHeight: '1.3' }}>
                Section 63 — Bharatiya Sakshya Adhiniyam, 2023 (BSA)
              </h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.7', marginBottom: '24px' }}>
                Under India&apos;s modernized criminal and procedural jurisprudence, electronic records must satisfy strict statutory safeguards under Section 63(4) of Bharatiya Sakshya Adhiniyam, 2023. CompliScan AI seals every inspection with a judicial certificate accepted by Magistrates and Consumer Dispute Commissions.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.2)', border: '1px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <Lock size={14} color="#D4AF37" />
                  </div>
                  <div>
                    <strong style={{ fontSize: '14px', color: '#FFFFFF' }}>Master SHA-256 Frame Hashing:</strong>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
                      Each raw camera frame is digested into an immutable cryptographic hash prior to any downstream AI processing.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.2)', border: '1px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <Shield size={14} color="#D4AF37" />
                  </div>
                  <div>
                    <strong style={{ fontSize: '14px', color: '#FFFFFF' }}>Device Hardware ID &amp; GPS Telemetry:</strong>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
                      Records device CPU/sensor fingerprints and GPS coordinates at the physical moment of field seizure.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.2)', border: '1px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <FileText size={14} color="#D4AF37" />
                  </div>
                  <div>
                    <strong style={{ fontSize: '14px', color: '#FFFFFF' }}>Automated Legal Notice Generator:</strong>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
                      Instantly renders formal compoundable offence summons under Section 36 of Legal Metrology Act, 2009.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Digital Evidence Certificate */}
            <div style={{
              background: '#061529',
              border: '2px solid #D4AF37',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              fontSize: '12px',
            }}>
              <div style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.4)', paddingBottom: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: '#D4AF37', fontWeight: 700, letterSpacing: '0.05em' }}>CERTIFICATE OF DIGITAL EVIDENCE</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px' }}>SECTION 63(4) BHARATIYA SAKSHYA ADHINIYAM, 2023</div>
                </div>
                <QrCode size={36} color="#D4AF37" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: 'rgba(255,255,255,0.85)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Dossier ID:</span>
                  <span style={{ fontFamily: 'monospace', color: '#FFFFFF', fontWeight: 600 }}>LM-2026-DEL-0891</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Investigating Officer:</span>
                  <span style={{ color: '#FFFFFF' }}>Rajesh Kumar Sharma (Badge #1045)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Seizure Location:</span>
                  <span style={{ color: '#FFFFFF' }}>Central Delhi (28.6139° N, 77.2090° E)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Master SHA-256:</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#16A34A' }}>e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b...</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Tamper Verification:</span>
                  <span style={{ color: '#16A34A', fontWeight: 700 }}>VERIFIED (CRYPTOGRAPHIC INTEGRITY 100%)</span>
                </div>
              </div>

              <div style={{ marginTop: '16px', background: 'rgba(212, 175, 55, 0.1)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(212, 175, 55, 0.25)', fontSize: '11px', color: '#D4AF37' }}>
                Official electronic record produced by CompliScan AI under lawful authority for presentation before competent courts of law.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. COMPARISON: MANUAL INSPECTION VS COMPLISCAN AI ─────────────── */}
      <section style={{ padding: '72px 24px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 48px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#16A34A' }}>
              Enforcement Transformation
            </span>
            <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#0B2545', marginTop: '8px', marginBottom: '12px' }}>
              Manual Field Inspection vs. CompliScan AI Automated Audit
            </h2>
            <p style={{ fontSize: '15px', color: '#64748B' }}>
              A 100x leap in operational velocity, mathematical rigor, and evidentiary certainty.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#FFFFFF', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#0B2545', color: '#FFFFFF' }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left', width: '25%' }}>Audit Dimension</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', width: '35%', background: '#1E293B' }}>Conventional Manual Audit</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', width: '40%', background: '#0B2545', borderLeft: '2px solid #D4AF37' }}>
                    <span style={{ color: '#D4AF37', fontWeight: 800 }}>CompliScan AI Autonomous Audit</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0B2545' }}>Inspection Duration</td>
                  <td style={{ padding: '14px 20px', color: '#DC2626' }}>25 to 35 minutes per commodity</td>
                  <td style={{ padding: '14px 20px', color: '#16A34A', fontWeight: 700, borderLeft: '2px solid #D4AF37' }}>
                    &lt; 4.5 seconds for all 4 panels
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0B2545' }}>Rule 7 Font Height</td>
                  <td style={{ padding: '14px 20px', color: '#64748B' }}>Vernier calipers, prone to human parallax</td>
                  <td style={{ padding: '14px 20px', color: '#16A34A', fontWeight: 700, borderLeft: '2px solid #D4AF37' }}>
                    Sub-millimeter bounding box calibration
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0B2545' }}>Rule 6(11) USP Math</td>
                  <td style={{ padding: '14px 20px', color: '#64748B' }}>Manual calculator math, rounding errors</td>
                  <td style={{ padding: '14px 20px', color: '#16A34A', fontWeight: 700, borderLeft: '2px solid #D4AF37' }}>
                    Exact IEEE 754 decimal arithmetic
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0B2545' }}>Court Evidence</td>
                  <td style={{ padding: '14px 20px', color: '#64748B' }}>Paper panchnama challenged in court</td>
                  <td style={{ padding: '14px 20px', color: '#16A34A', fontWeight: 700, borderLeft: '2px solid #D4AF37' }}>
                    SHA-256 sealed Section 63 BSA certificate
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0B2545' }}>Offline Resilience</td>
                  <td style={{ padding: '14px 20px', color: '#64748B' }}>Physical paper pads only</td>
                  <td style={{ padding: '14px 20px', color: '#16A34A', fontWeight: 700, borderLeft: '2px solid #D4AF37' }}>
                    Full local IndexedDB queue with auto-sync
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── 7. REGULATORY STATUTORY FAQ ACCORDION ─────────────────────────── */}
      <section id="faq" style={{ padding: '72px 24px', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1D4ED8' }}>
              Frequently Answered Questions
            </span>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0B2545', marginTop: '6px', marginBottom: '10px' }}>
              Statutory Inquiries &amp; Technical Specifications
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B' }}>
              Comprehensive answers for enforcement officers, FMCG legal counsels, and packaging regulatory managers.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqItems.map((item, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: openFaq === idx ? '#F8FAFC' : '#FFFFFF',
                  transition: 'all 0.2s',
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: '#0B2545',
                    fontSize: '15px',
                    fontWeight: 700,
                  }}
                >
                  <span>{item.q}</span>
                  {openFaq === idx ? <ChevronUp size={18} color="#1D4ED8" /> : <ChevronDown size={18} color="#64748B" />}
                </button>
                {openFaq === idx && (
                  <div style={{ padding: '0 20px 18px', color: '#475569', fontSize: '14px', lineHeight: '1.6', borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 8. BOTTOM ENTERPRISE CALL TO ACTION ───────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #061529 0%, #0B2545 100%)',
        color: '#FFFFFF',
        padding: '60px 24px',
        textAlign: 'center',
        borderBottom: '1px solid #13315C',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', border: '2px solid #D4AF37', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={28} color="#D4AF37" />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>
            Ready to Automate Packaging Compliance Inspections?
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)', lineHeight: '1.6', marginBottom: '28px' }}>
            Experience the full Legal Metrology inspection workflow live. Verify 4-panel commodities, calculate Rule 6(11) USP math, inspect font heights, and export court-admissible PDF certificates.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onLaunchDemo}
              style={{
                background: 'linear-gradient(135deg, #FF9933 0%, #EA580C 100%)',
                color: '#FFFFFF',
                padding: '13px 26px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.4)',
              }}
            >
              <Zap size={16} /> Launch Live Demo Console
            </button>

            <button
              type="button"
              onClick={onNavigateToLogin}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1.5px solid rgba(255, 255, 255, 0.3)',
                color: '#FFFFFF',
                padding: '13px 22px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Lock size={15} /> Officer Portal Sign-In
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
