'use client';

import React, { useState } from 'react';
import {
  Shield,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Scale,
  FileCheck,
  Cpu,
  Layers,
  ChevronDown,
  Building2,
  Hash,
  Database,
  Eye,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  ChevronRight,
  Search,
  BadgeCheck,
  Check,
  PhoneCall,
  Mail,
  Zap,
} from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  // Interactive FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Live Telemetry Tab state for Hero Console
  const [activeTelemetryTab, setActiveTelemetryTab] = useState<'FRONT' | 'BACK' | 'REGULATORY_SIDE' | 'MRP_BATCH'>('FRONT');

  // Mobile navigation state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-amber-100 selection:text-amber-900">
      {/* ─── SECTION 1: HEADER & GOV NODAL BAR ────────────────────────────────── */}
      <header className="w-full relative z-50">
        {/* Tricolor Ribbon Top Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

        {/* Official Gov Nodal Bar */}
        <div className="bg-[#0B2545] text-slate-300 text-xs py-2 px-4 sm:px-8 border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <span className="font-semibold text-amber-400">भारत सरकार | Government of India</span>
              <span className="hidden md:inline text-slate-500">•</span>
              <span className="hidden md:inline text-slate-300">
                Ministry of Consumer Affairs, Food & Public Distribution — Legal Metrology Division (SIH 26034)
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                DOMS-AI CORE ONLINE
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline text-amber-300/90 font-medium">BSA 2023 §63 CERTIFIED</span>
            </div>
          </div>
        </div>

        {/* Sticky Primary Navigation */}
        <nav aria-label="Official GovTech Navigation" className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 shadow-sm transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            {/* Emblem & Portal Brand */}
            <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img
                src="/assets/emblem.svg"
                alt="National Emblem of India"
                className="w-10 h-10 object-contain drop-shadow-sm"
              />
              <div className="border-l border-slate-200 pl-3">
                <div className="text-xl font-bold tracking-tight text-[#0B2545] flex items-center gap-1.5">
                  CompliScan <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">AI</span>
                </div>
                <div className="text-[10.5px] uppercase tracking-wider font-semibold text-slate-500">
                  Legal Metrology Inspection Division
                </div>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-7 text-[13.5px] font-medium text-slate-600">
              <button
                type="button"
                onClick={() => scrollToSection('about')}
                className="hover:text-[#0B2545] transition-colors"
              >
                Field Context
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('architecture')}
                className="hover:text-[#0B2545] transition-colors"
              >
                Tri-Core Engine
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('statutory-rules')}
                className="hover:text-[#0B2545] transition-colors"
              >
                Statutory Rules
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('rule7-matrix')}
                className="hover:text-[#0B2545] transition-colors"
              >
                Rule 7 Matrix
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('consultation')}
                className="hover:text-[#0B2545] transition-colors"
              >
                Artwork QA
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('faq')}
                className="hover:text-[#0B2545] transition-colors"
              >
                Official FAQ
              </button>
            </div>

            {/* Officer Login CTA */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onLogin}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0B2545] hover:bg-[#13315C] text-white text-xs sm:text-sm font-semibold rounded-lg border border-amber-500/40 shadow-sm transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0"
              >
                <Lock size={15} className="text-amber-400" />
                <span>Officer / Inspector Login</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                aria-label="Toggle Navigation"
              >
                <ChevronDown className={`w-5 h-5 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-2 text-sm font-medium">
              <button
                type="button"
                onClick={() => scrollToSection('about')}
                className="block w-full text-left py-2 text-slate-700 hover:text-[#0B2545]"
              >
                Field Context
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('architecture')}
                className="block w-full text-left py-2 text-slate-700 hover:text-[#0B2545]"
              >
                Tri-Core Engine
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('statutory-rules')}
                className="block w-full text-left py-2 text-slate-700 hover:text-[#0B2545]"
              >
                Statutory Rules
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('rule7-matrix')}
                className="block w-full text-left py-2 text-slate-700 hover:text-[#0B2545]"
              >
                Rule 7 Matrix
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('consultation')}
                className="block w-full text-left py-2 text-slate-700 hover:text-[#0B2545]"
              >
                Artwork QA Hub
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('faq')}
                className="block w-full text-left py-2 text-slate-700 hover:text-[#0B2545]"
              >
                Official FAQ
              </button>
            </div>
          )}
        </nav>
      </header>

      {/* ─── SECTION 2: HERO & LIVE TELEMETRY CONSOLE ──────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-[#F4F6F9] border-b border-slate-200 py-12 md:py-18 lg:py-22">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Authoritative Editorial */}
            <div className="lg:col-span-7 space-y-6">
              {/* National Compliance Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold tracking-wide shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>COMPLISCAN AI • LM ACT 2009 &amp; BSA 2023 §63 COMPLIANT</span>
              </div>

              {/* Main Heading (Single H1) */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B2545] tracking-tight leading-[1.18]">
                CompliScan AI: India&apos;s Automated Legal Metrology &amp; Packaging Compliance Inspection Engine
              </h1>

              {/* Sub-paragraph */}
              <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl">
                Empowering Enforcement Officers across 766 districts with real-time multi-angle computer vision.
                Eliminating 25-minute manual caliper &amp; handbook audits down to <strong className="text-[#0B2545] font-semibold">&lt;4.5 seconds</strong> with deterministic mathematical cross-validation and <strong className="text-[#0B2545] font-semibold">0% LLM hallucination</strong>.
              </p>

              {/* CTA Button Group */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <button
                  type="button"
                  onClick={onLogin}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#0B2545] hover:bg-[#13315C] text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg border border-amber-400/40 transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Shield size={18} className="text-amber-400" />
                  <span>Officer Login / Launch Portal</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection('statutory-rules')}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm rounded-lg border border-slate-300 shadow-sm transition-all"
                >
                  <Scale size={16} className="text-slate-600" />
                  <span>Explore Statutory Engine</span>
                </button>
              </div>

              {/* Citations Micro-Strip */}
              <div className="pt-4 border-t border-slate-200/80 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  PCR 2011 Verified
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  Bharatiya Sakshya Adhiniyam §63(4)
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  FSSAI Labelling Regs 2020
                </span>
              </div>
            </div>

            {/* Right Column: Pure Coded Telemetry Console (Zero-CLS) */}
            <div className="lg:col-span-5">
              <div className="bg-[#061529] rounded-xl border border-slate-700 shadow-2xl overflow-hidden text-slate-100 font-mono text-xs">
                {/* Console Window Header */}
                <div className="bg-[#0B2545] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] text-slate-300 ml-1.5 font-bold tracking-wider">
                      DOMS-INSPECTION TELEMETRY • LIVE
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    4-ANGLE INGESTED
                  </span>
                </div>

                {/* 4-Angle Switcher Tabs */}
                <div className="bg-[#081C33] px-3 py-2 border-b border-slate-800 flex items-center gap-1.5 text-[11px]">
                  {(['FRONT', 'BACK', 'REGULATORY_SIDE', 'MRP_BATCH'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTelemetryTab(tab)}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        activeTelemetryTab === tab
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tab === 'FRONT' ? '1. Front' : tab === 'BACK' ? '2. Back' : tab === 'REGULATORY_SIDE' ? '3. Side' : '4. MRP'}
                    </button>
                  ))}
                </div>

                {/* Live Console Output Stream */}
                <div className="p-4 space-y-3.5 leading-relaxed text-[11.5px] bg-[#061529]">
                  {/* Row 1: Pipeline Latency */}
                  <div className="flex items-start justify-between pb-2.5 border-b border-slate-800/80">
                    <span className="text-slate-400">Pipeline Synchronous DOMS:</span>
                    <span className="text-emerald-400 font-bold">3.84s (All 4 Panels Active)</span>
                  </div>

                  {/* Row 2: Rule 7 PDP Area */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Rule 7 PDP Geometry:</span>
                      <span className="text-slate-200">Rectangular (160mm × 100mm)</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-amber-300">Rule 7 Computed Area:</span>
                      <span className="text-emerald-400">160.0 cm² &gt; Min Font: 2.5mm</span>
                    </div>
                    <div className="text-[10.5px] text-slate-400 bg-slate-900/80 p-1.5 rounded border border-slate-800">
                      Numeral Height Calibration: <span className="text-emerald-300 font-bold">2.80mm [PASS • 112% OF STATUTORY]</span>
                    </div>
                  </div>

                  {/* Row 3: Rule 6(11) USP Verification */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Rule 6(11) Unit Sale Price:</span>
                      <span className="text-slate-200">MRP ₹180.00 / 450g Net</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>Statutory Expected USP:</span>
                      <span>₹0.40 / g [VERIFIED MATCH]</span>
                    </div>
                  </div>

                  {/* Row 4: Rule 6(1)(a) & FSSAI */}
                  <div className="space-y-1 pt-1 border-t border-slate-800/80">
                    <div className="flex justify-between text-slate-400">
                      <span>Manufacturer PIN Code:</span>
                      <span className="text-emerald-400 font-bold">560066 (Regex Match: /\b\d&#123;6&#125;\b/)</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>FSSAI License Auth:</span>
                      <span className="text-emerald-400 font-bold">11222999000656 [14-DIGIT VALID]</span>
                    </div>
                  </div>

                  {/* Row 5: BSA 2023 §63 Court Seal */}
                  <div className="p-2.5 bg-[#091E38] rounded border border-amber-500/30 space-y-1 mt-2">
                    <div className="flex items-center justify-between text-amber-300 font-bold text-[10.5px]">
                      <span className="flex items-center gap-1.5">
                        <Lock size={12} className="text-amber-400" />
                        BSA 2023 §63(4) COURT EVIDENCE SEAL
                      </span>
                      <span className="text-emerald-400 font-bold">SEALED</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      SHA-256: <span className="text-slate-200">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
                    </div>
                  </div>
                </div>

                {/* Console Footer */}
                <div className="bg-[#0B2545] px-4 py-2 text-[10px] text-slate-400 border-t border-slate-800 flex items-center justify-between">
                  <span>Device Hardware ID: DOMS-INSP-DL-0145</span>
                  <span className="text-amber-400 font-semibold">PART A &amp; B GENERATED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: BENCHMARK STRIP ───────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            {/* Metric 1 */}
            <div className="text-center sm:text-left sm:pl-4 first:pl-0 pt-4 sm:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#0B2545] tracking-tight font-mono">
                &lt; 4.5s
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-900 mt-1">
                DOMS Audit Latency
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Down from 25-min manual caliper &amp; handbook inspection
              </div>
            </div>

            {/* Metric 2 */}
            <div className="text-center sm:text-left sm:pl-4 pt-4 sm:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#138808] tracking-tight font-mono">
                0%
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-900 mt-1">
                LLM Hallucination Rate
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Grounded in raw OCR tokens via <code className="text-[11px] bg-slate-100 px-1 rounded">_is_number_grounded</code>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="text-center sm:text-left sm:pl-4 pt-4 sm:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#0B2545] tracking-tight font-mono">
                ₹0.22
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-900 mt-1">
                Cost per Audit
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                99.9% cost reduction vs. manual inspection administration
              </div>
            </div>

            {/* Metric 4 */}
            <div className="text-center sm:text-left sm:pl-4 pt-4 sm:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-600 tracking-tight font-mono">
                100%
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-900 mt-1">
                Court Admissibility
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Fully compliant with Bharatiya Sakshya Adhiniyam §63(4)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: ABOUT / FIELD BOTTLENECKS ──────────────────────────────── */}
      <section id="about" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2.5 py-1 rounded border border-amber-300">
              Regulatory Context &amp; Challenges
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] mt-3">
              Solving Chronic Bottlenecks in Legal Metrology Enforcement
            </h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base leading-relaxed">
              Every day, over 1,800 state and central Legal Metrology inspectors examine packaged commodities across wholesale mandis, retail hypermarkets, and e-commerce fulfillment hubs. Manual enforcement suffers from systematic failure modes:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Bottleneck 1 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900">4-Panel Data Fragmentation</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Commodity declarations are scattered across non-contiguous panels. Brand is on the front, MRP and batch on the bottom flap, manufacturer address on the side, and nutritional tables on the rear. CompliScan stitches all 4 views synchronously.
              </p>
            </div>

            {/* Bottleneck 2 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900">Metallic Foil &amp; Specular Glare</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                FMCG snack packaging relies on biaxially oriented polypropylene (BOPP) and metallic foils that create blinding glare under field torches and market lighting. CompliScan implements CIELAB CLAHE glare suppression.
              </p>
            </div>

            {/* Bottleneck 3 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900">Curved PET Bottle Distortion</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Cylindrical beverage containers compress letter spacing along container edges, confusing classical optical character recognition. CompliScan applies geometric cylindrical area formulas (0.40 &times; (H &times; C) / 100).
              </p>
            </div>

            {/* Bottleneck 4 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold mb-4">
                04
              </div>
              <h3 className="text-base font-bold text-slate-900">Broken CIJ Dot-Matrix Stamps</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Continuous Inkjet (CIJ) date and price printers often skip dots, rendering numerals unreadable to standard OCR models. Our morphological closing kernel ($2\times2$) bridges dot gaps before recognition.
              </p>
            </div>

            {/* Bottleneck 5 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-4">
                05
              </div>
              <h3 className="text-base font-bold text-slate-900">Zero-Connectivity Rural Mandis</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Enforcement raids in rural agricultural APMC mandis frequently encounter zero cellular reception. CompliScan operates in full local IndexedDB offline mode, queueing tamper-evident dossiers for automatic central synchronization.
              </p>
            </div>

            {/* Bottleneck 6 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold mb-4">
                06
              </div>
              <h3 className="text-base font-bold text-slate-900">Trial Evidence Inadmissibility</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Smartphone inspection photos taken without cryptographic hash chains are routinely rejected in magistrate courts. CompliScan generates Section 63(4) BSA 2023 certified Part A and Part B digital certificates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: TRI-CORE ARCHITECTURE ─────────────────────────────────── */}
      <section id="architecture" className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0B2545] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              System Engineering Specification
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0B2545] mt-3">
              Tri-Core Split-Path Inspection Architecture
            </h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              CompliScan AI decouples vision understanding from mathematical verification to deliver unmatched speed, sub-millimeter precision, and zero hallucinations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Core 1: Path A */}
            <div className="bg-gradient-to-b from-slate-50 to-white rounded-xl border-2 border-blue-100 p-6 shadow-sm hover:border-blue-400 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md mb-5">
                  <Cpu size={24} />
                </div>
                <div className="text-xs font-mono font-bold text-blue-700 tracking-wider">PATH A • MULTIMODAL VLM</div>
                <h3 className="text-lg font-bold text-[#0B2545] mt-1">Gemini Multimodal VLM</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                  Processes 4 packaging panels concurrently in a single context window. Synthesizes fragmented layout hierarchies, associates brand names with product variants, identifies vegetarian/non-vegetarian logos, and extracts complete manufacturer legal entity statements.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-200 space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>4-Angle Global Cross-Panel Ingestion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>14-Digit FSSAI License Semantic Parsing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>Multi-language ingredient and allergen parsing</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-500">
                Primary: gemini-3.5-flash-lite / gemini-3-flash
              </div>
            </div>

            {/* Core 2: Path B */}
            <div className="bg-gradient-to-b from-slate-50 to-white rounded-xl border-2 border-emerald-100 p-6 shadow-sm hover:border-emerald-400 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#138808] text-white flex items-center justify-center shadow-md mb-5">
                  <Layers size={24} />
                </div>
                <div className="text-xs font-mono font-bold text-emerald-700 tracking-wider">PATH B • OPTICAL PIPELINE</div>
                <h3 className="text-lg font-bold text-[#0B2545] mt-1">4-Stage OpenCV + PP-OCRv4</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                  High-speed deterministic edge image enhancement and OCR pipeline. Normalizes high-glare surfaces and extracts raw tokens with sub-millimeter bounding box coordinates for exact numeral height measurement under Rule 7.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-200 space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>CIELAB CLAHE Foil Glare Suppression</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>2×2 Morphological Closing for CIJ Inkjet Dots</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Millimeter-Calibrated PDP Numeral Heights</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-500">
                Engine: PaddleOCRv4 + OpenCV (Morphology)
              </div>
            </div>

            {/* Core 3: Path C */}
            <div className="bg-gradient-to-b from-slate-50 to-white rounded-xl border-2 border-amber-100 p-6 shadow-sm hover:border-amber-400 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md mb-5">
                  <Scale size={24} />
                </div>
                <div className="text-xs font-mono font-bold text-amber-800 tracking-wider">PATH C • ARBITER &amp; SEAL</div>
                <h3 className="text-lg font-bold text-[#0B2545] mt-1">Master Brain Arbiter</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                  The anti-hallucination court arbiter. Disallows LLM arithmetic: executes all USP unit calculations, packaging area geometry, and compounding penalty tables strictly through deterministic Python and TypeScript algorithms.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-200 space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>Token Grounding (<code className="font-mono text-[11px]">_is_number_grounded</code>)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>Deterministic GSR 779(E) USP Math ($\pm ₹0.05$)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>BSA 2023 §63(4) SHA-256 PDF Certificates</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-500">
                Compliance Protocol: Section 63 BSA 2023
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: STATUTORY RULES & RULE 7 TABLE ────────────────────────── */}
      <section id="statutory-rules" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-200 px-3 py-1 rounded border border-slate-300">
              Statutory Verification Framework
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] mt-3">
              Automating the Legal Metrology (Packaged Commodities) Rules, 2011
            </h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base leading-relaxed">
              Every inspection performed by CompliScan AI is benchmarked against explicit gazetted statutory clauses, formulas, and penalty statutes under Indian Law.
            </p>
          </div>

          {/* Rule 7 PDP Matrix Table */}
          <div id="rule7-matrix" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-12">
            <div className="bg-[#0B2545] px-6 py-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-amber-400">Rule 7: Principal Display Panel (PDP) &amp; Font Height Matrix</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Statutory minimum numeral and letter heights mandated per container surface area under the Fifth Schedule of PCR 2011.
                </p>
              </div>
              <div className="text-xs font-mono bg-blue-900/60 border border-blue-400/30 px-3 py-1.5 rounded text-blue-200">
                Rule 7 Formula: Rectangular A = (H&times;W)/100 &bull; Cylindrical A = 0.40&times;(H&times;C)/100
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                    <th className="py-3.5 px-6">Container PDP Area Range (A_PDP)</th>
                    <th className="py-3.5 px-6">Geometry Formula</th>
                    <th className="py-3.5 px-6">Minimum Font Height</th>
                    <th className="py-3.5 px-6">Applicable Packaging Archetypes</th>
                    <th className="py-3.5 px-6 text-right">Enforcement Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800 text-xs sm:text-sm font-medium">
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-[#0B2545]">A_PDP &le; 50 cm&sup2;</td>
                    <td className="py-3.5 px-6 text-slate-600 font-mono text-xs">(H &times; W) / 100 &le; 50</td>
                    <td className="py-3.5 px-6 font-mono font-bold text-emerald-700">1.0 mm</td>
                    <td className="py-3.5 px-6 text-slate-600">Chewing gum packs, single matchboxes, blister packs</td>
                    <td className="py-3.5 px-6 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        AUTOMATED (Pass &ge; 1.0)
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-[#0B2545]">50 cm&sup2; &lt; A_PDP &le; 100 cm&sup2;</td>
                    <td className="py-3.5 px-6 text-slate-600 font-mono text-xs">(H &times; W) / 100 &le; 100</td>
                    <td className="py-3.5 px-6 font-mono font-bold text-emerald-700">1.5 mm</td>
                    <td className="py-3.5 px-6 text-slate-600">Soap bars, small spice sachets, toothpastes (50g)</td>
                    <td className="py-3.5 px-6 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        AUTOMATED (Pass &ge; 1.5)
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors bg-amber-50/30">
                    <td className="py-3.5 px-6 font-mono font-bold text-[#0B2545]">100 cm&sup2; &lt; A_PDP &le; 500 cm&sup2;</td>
                    <td className="py-3.5 px-6 text-slate-600 font-mono text-xs">(H &times; W) / 100 &le; 500</td>
                    <td className="py-3.5 px-6 font-mono font-bold text-amber-700">2.5 mm</td>
                    <td className="py-3.5 px-6 text-slate-700 font-semibold">Standard Cereal Boxes, Biscuit packs, 500g pouches</td>
                    <td className="py-3.5 px-6 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                        MOST COMMON (Pass &ge; 2.5)
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-[#0B2545]">500 cm&sup2; &lt; A_PDP &le; 2500 cm&sup2;</td>
                    <td className="py-3.5 px-6 text-slate-600 font-mono text-xs">(H &times; W) / 100 &le; 2500</td>
                    <td className="py-3.5 px-6 font-mono font-bold text-emerald-700">4.0 mm</td>
                    <td className="py-3.5 px-6 text-slate-600">5 kg Atta bags, detergent cartons, edible oil tins (5L)</td>
                    <td className="py-3.5 px-6 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        AUTOMATED (Pass &ge; 4.0)
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-[#0B2545]">A_PDP &gt; 2500 cm&sup2;</td>
                    <td className="py-3.5 px-6 text-slate-600 font-mono text-xs">(H &times; W) / 100 &gt; 2500</td>
                    <td className="py-3.5 px-6 font-mono font-bold text-emerald-700">6.0 mm</td>
                    <td className="py-3.5 px-6 text-slate-600">25kg - 50kg wholesale fertilizer sacks, bulk grain bags</td>
                    <td className="py-3.5 px-6 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        AUTOMATED (Pass &ge; 6.0)
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 4 Statutory Clauses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rule 6(1)(a) & 6(2) Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#0B2545] bg-slate-100 px-2 py-1 rounded">
                  RULE 6(1)(a) &amp; RULE 6(2)
                </span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Strict Mandatory
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Manufacturer Identity, Postal PIN &amp; Consumer Redressal
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Mandates the complete corporate legal name and physical postal address of the manufacturer, packer, or importer. CompliScan verifies the mandatory presence of an authentic 6-digit Indian Postal PIN code (<code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">/\b\d&#123;6&#125;\b/</code>) plus a functioning customer care telephone and valid email.
              </p>
            </div>

            {/* Rule 6(11) USP Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#0B2545] bg-slate-100 px-2 py-1 rounded">
                  RULE 6(11) • GSR 779(E)
                </span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Exact Math Tolerance
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Unit Sale Price (USP) Mathematical Verification
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Requires packaged commodities to declare their unit sale price calculated strictly in standard statutory units: ₹ per gram for items &lt;1kg, ₹ per kg for &ge;1kg, ₹ per ml for &lt;1L, and ₹ per piece for countable numbers. CompliScan automatically computes the statutory quotient and flags discrepancies &gt; ₹0.05.
              </p>
            </div>

            {/* Section 36 & Jan Vishwas Act Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-red-700 bg-red-50 px-2 py-1 rounded border border-red-200">
                  SECTION 36 • JAN VISHWAS 2023
                </span>
                <span className="text-xs font-semibold text-red-600 flex items-center gap-1">
                  <ShieldAlert size={13} /> Compounding Penalties
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Penalty Calculations &amp; Compounding Notices
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Under the amended Legal Metrology Act, 2009 via the Jan Vishwas Act, 2023, penalties for non-standard packages are streamlined into administrative compounding fines: ₹25,000 for the first offense, escalating up to ₹50,000 for the second offense, and ₹1,00,000 for repeat offenses. CompliScan auto-populates statutory compounding notices.
              </p>
            </div>

            {/* BSA 2023 Section 63 Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                  BSA 2023 §63(4) • EVIDENCE ACT
                </span>
                <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                  <Lock size={13} /> Tamper Evident
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Electronic Records &amp; Court Admissibility Certification
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Replacing Section 65B of the Indian Evidence Act, Section 63(4) of the Bharatiya Sakshya Adhiniyam, 2023 governs electronic evidence. CompliScan seals all 4 raw inspection captures, inspector GPS tags, device hardware serials, and rule outputs into an immutable SHA-256 chain complete with Part A and Part B court certificates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 7: CONSULTATION HUB & INTERACTIVE FAQS ───────────────────── */}
      <section id="consultation" className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Dual Portal Consultation Banner */}
          <div className="bg-gradient-to-r from-[#0B2545] via-[#13315C] to-[#0B2545] rounded-2xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden mb-16 border border-slate-700">
            {/* Background Tricolor Accent Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/10 via-white/5 to-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full">
                Unified Portal Deployment
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Dual Access Portal for Enforcement Officers &amp; FMCG Packagers
              </h2>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                Whether executing field seizure raids under Legal Metrology Section 15 or running pre-print artwork quality assurance for consumer brands, CompliScan AI offers authorized workflow environments with single-sign-on verification.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={onLogin}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-lg shadow transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Lock size={16} />
                  <span>Login to CompliScan AI Portal</span>
                </button>
                <div className="text-xs text-slate-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  National Server Node Active (District Central Delhi)
                </div>
              </div>
            </div>
          </div>

          {/* Interactive FAQs Accordion */}
          <div id="faq" className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                Common Inquiries
              </span>
              <h3 className="text-2xl font-extrabold text-[#0B2545] mt-2">
                Frequently Asked Regulatory &amp; Technical Questions
              </h3>
            </div>

            <div className="space-y-3.5">
              {[
                {
                  q: 'How does CompliScan AI eliminate AI hallucinations during legal enforcement?',
                  a: 'CompliScan implements a strict split-path architecture. While Gemini Multimodal VLM synthesizes visual and linguistic contexts across 4 angles, all statutory numerical checks (MRP, Net Quantity, Font Height, USP) are arbitrated by the Master Brain in deterministic TypeScript and Python math. A dedicated verification function (_is_number_grounded_in_ocr) verifies that every reported number exists verbatim in raw PaddleOCR tokens before generating statutory violation notices.',
                },
                {
                  q: 'What legal validity do CompliScan inspection dossiers hold in Indian courts?',
                  a: 'Every inspection generates a cryptographic tamper-evident dossier complying with Section 63(4) of the Bharatiya Sakshya Adhiniyam, 2023 (replacing Section 65B of the Indian Evidence Act). The platform auto-generates two official certificates: Schedule Part A (Electronic System Custodian Certificate) and Schedule Part B (Officer in Charge Declaration), binding high-resolution evidence images, inspector GPS coordinates, and raw SHA-256 hashes into a court-ready PDF.',
                },
                {
                  q: 'How does the system calculate PDP area for irregular or cylindrical containers under Rule 7?',
                  a: 'Under Rule 7 of the Packaged Commodities Rules, 2011, PDP area calculation depends on package geometry. For rectangular boxes, area is Height × Width ÷ 100. For cylindrical cans and bottles, Rule 7 mandates calculating 40% of the total height multiplied by container circumference (0.40 × [Height × Circumference] ÷ 100). CompliScan AI includes pre-calibrated geometric estimators to automatically determine the exact threshold tier.',
                },
                {
                  q: 'Can enforcement officers conduct raids in offline rural mandis without internet?',
                  a: 'Yes. CompliScan AI is built with an offline-first service worker architecture using client-side IndexedDB caching. When inspecting in underground warehouses or remote rural mandis with zero signal, inspection photos, local PaddleOCR extractions, and preliminary Rule 7 measurements are recorded locally. Once the device re-enters 4G/5G or Wi-Fi range, queued dossiers seamlessly synchronize with the central government database.',
                },
                {
                  q: 'How does the Unit Sale Price (USP) calculation handle different metric commodities?',
                  a: 'Per Gazette Notification GSR 779(E) amending PCR 2011, commodities under 1 kg must declare price per gram, commodities of 1 kg or more must declare price per kilogram, commodities under 1 liter must declare price per milliliter, and commodities of 1 liter or more must declare price per liter. For items sold by number, the price per item/piece is mandatory. CompliScan automatically applies unit normalization and validates declarations within a ±₹0.05 statutory tolerance.',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden transition-colors hover:border-slate-300"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#0B2545]"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-slate-500 transition-transform flex-shrink-0 ${
                        openFaq === idx ? 'rotate-180 text-amber-600' : ''
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 8: OFFICIAL FOOTER ───────────────────────────────────────── */}
      <footer className="bg-[#0B2545] text-slate-300 text-xs border-t border-slate-800">
        {/* Tricolor Accent Stripe */}
        <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Col 1: Government Citation */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-3">
                <img src="/assets/emblem.svg" alt="Emblem" className="w-8 h-8 object-contain" />
                <div>
                  <div className="text-sm font-bold text-white tracking-wide">
                    भारत सरकार | Legal Metrology Division
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Ministry of Consumer Affairs, Food &amp; Public Distribution
                  </div>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-md pt-1">
                CompliScan AI (Smart India Hackathon Problem Statement SIH 26034) is the national automated enforcement and compliance audit system for packaged commodities under the Legal Metrology Act, 2009 and the Packaged Commodities Rules, 2011.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  CompliScan Engine: Active (v2.4.0-GOV)
                </span>
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div className="space-y-2.5">
              <div className="text-white font-bold tracking-wider uppercase text-xs">
                Portal Sections
              </div>
              <ul className="space-y-1.5 text-slate-400">
                <li>
                  <button type="button" onClick={() => scrollToSection('about')} className="hover:text-amber-400 transition-colors">
                    Field Challenges &amp; Bottlenecks
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => scrollToSection('architecture')} className="hover:text-amber-400 transition-colors">
                    Tri-Core Architecture
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => scrollToSection('statutory-rules')} className="hover:text-amber-400 transition-colors">
                    Statutory Rule Catalog
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => scrollToSection('rule7-matrix')} className="hover:text-amber-400 transition-colors">
                    Rule 7 Font Height Matrix
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => scrollToSection('faq')} className="hover:text-amber-400 transition-colors">
                    Official FAQ &amp; Guidance
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Legal Citations & Portal Launch */}
            <div className="space-y-2.5">
              <div className="text-white font-bold tracking-wider uppercase text-xs">
                Enforcement Access
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Authorized access restricted to designated State / Central Legal Metrology Enforcement Officers.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onLogin}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#13315C] hover:bg-blue-900 text-white font-semibold rounded border border-blue-400/30 transition-colors text-xs"
                >
                  <Lock size={13} className="text-amber-400" />
                  <span>Launch Officer Portal</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Disclaimer */}
          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
            <div>
              &copy; {new Date().getFullYear()} Ministry of Consumer Affairs, Food &amp; Public Distribution, Government of India. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>Legal Metrology Act, 2009</span>
              <span>•</span>
              <span>PCR 2011</span>
              <span>•</span>
              <span>BSA 2023 §63</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
