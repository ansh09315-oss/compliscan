'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Lock,
  Plus,
} from 'lucide-react';
import { DEFAULT_INSPECTOR } from '@/lib/store';
import type { Inspector } from '@/types/metrology';

interface SpatialLandingPageProps {
  onLoginClick: () => void;
}

export default function SpatialLandingPage({ onLoginClick }: SpatialLandingPageProps) {
  // Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  // Single Technical Documentation accordion state (hidden by default)
  const [isTechDocOpen, setIsTechDocOpen] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDirectLogin = () => {
    onLoginClick();
  };

  const faqItems = [
    {
      q: 'How does CompliScan AI inspect product packaging in under 4.5 seconds?',
      a: 'CompliScan AI fuses a multimodal dual-pipeline engine. High-resolution packaging photos pass through GPU-accelerated CIELAB glare reduction and sub-millimeter OCR tokenization while simultaneously evaluating bounding boxes against Legal Metrology statutory matrices in parallel.',
    },
    {
      q: 'Which Packaged Commodities Rules (PCR 2011) are verified automatically?',
      a: 'The engine audits Rule 7 Principal Display Panel (PDP) font heights mapped to surface area geometry, Rule 6(11) Unit Sale Price (USP) normalized arithmetic (₹/g, ₹/kg, ₹/ml, ₹/l, ₹/piece), manufacturer declarations, net quantity declarations, and consumer care helplines.',
    },
    {
      q: 'Are the generated digital evidence reports admissible under BSA Section 63?',
      a: 'Yes. Every generated inspection dossier automatically produces Schedule Part A & B electronic evidence certificates under Section 63(4) of the Bharatiya Sakshya Adhiniyam, 2023. Raw images, bounding boxes, and verdicts are bound with master SHA-256 cryptographic hashes and device hardware IDs.',
    },
    {
      q: 'How do authorized Legal Metrology officers log in to the portal?',
      a: 'Enforcement officers click "Officer Login" on this portal to open the secure vault. Authentication is granted through official credentials, verified district jurisdiction keys, or the instant inspector simulation sandbox.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#0F172A] font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden scroll-smooth flex flex-col justify-between">
      {/* ─── 1. HEADER: WHITE STICKY NAVBAR ───────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 border-b border-slate-200">
        <div
          style={{ maxWidth: '1040px', margin: '0 auto' }}
          className="max-w-5xl w-full mx-auto h-20 px-6 flex items-center justify-between"
        >
          {/* Left Brand Logo */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0F172A] rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-[#0F172A]">
              CompliScan <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">AI</span>
            </span>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => scrollTo('about')}
              className="hover:text-[#0F172A] transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => scrollTo('faq')}
              className="hover:text-[#0F172A] transition-colors cursor-pointer"
            >
              FAQ
            </button>
            <button
              type="button"
              onClick={() => {
                setIsTechDocOpen(true);
                scrollTo('technical-approach');
              }}
              className="hover:text-[#0F172A] transition-colors cursor-pointer"
            >
              Technical Approach
            </button>
          </nav>

          {/* Right Login Trigger */}
          <button
            type="button"
            onClick={handleDirectLogin}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md shadow-emerald-500/20 cursor-pointer flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Lock className="w-4 h-4" />
            <span>Officer Login &rarr;</span>
          </button>
        </div>
      </header>

      {/* ─── MAIN CONTENT CONTAINER ───────────────────────────────────────── */}
      <main className="w-full flex-1 flex flex-col items-center">
        {/* ─── 2. HERO: CENTERED HEADING, SUBTITLE & MASSIVE LOGIN BUTTON ───── */}
        <section className="pt-24 pb-16 w-full flex flex-col items-center justify-center px-6 bg-white">
          <div
            style={{ maxWidth: '1040px', margin: '0 auto' }}
            className="max-w-5xl w-full mx-auto flex flex-col items-center text-center"
          >
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold tracking-widest uppercase text-emerald-800 mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>MINISTRY OF CONSUMER AFFAIRS &bull; LEGAL METROLOGY PORTAL</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#0F172A] leading-[1.08] mb-6 max-w-4xl">
              CompliScan <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">AI</span>
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-600 mt-3 block tracking-normal">
                Deterministic Packaging Compliance &amp; Inspection Engine.
              </span>
            </h1>

            {/* Concise Subtitle */}
            <p className="max-w-xl mx-auto text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed font-normal">
              Verify 4-angle product declarations under the Legal Metrology Act 2009 &amp; PCR 2011 in under 4.5 seconds.
            </p>

            {/* ─── GAP 1: EXACT 32px (mb-8) BELOW SUBTITLE ─── */}
            <div style={{ height: '32px', minHeight: '32px' }} className="w-full h-8" aria-hidden="true" />

            {/* MASSIVE OFFICER LOGIN ENTRY POINT */}
            <div className="flex justify-center w-full">
              <button
                type="button"
                onClick={handleDirectLogin}
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-lg md:text-xl font-extrabold tracking-tight shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-3"
              >
                <Shield className="w-6 h-6 text-white" />
                <span>Official Officer Login Portal &rarr;</span>
              </button>
            </div>

            {/* ─── GAP 2: LARGE 80px (mb-20) TWO-LINE VERTICAL GAP BELOW LOGIN BUTTON ─── */}
            <div style={{ height: '80px', minHeight: '80px' }} className="w-full h-20" aria-hidden="true" />
          </div>
        </section>

        {/* ─── 3. FAQ: CENTERED INTERACTIVE ACCORDION WITH SPECIFIC GAPS ────── */}
        <section
          id="faq"
          className="pt-12 pb-24 w-full flex flex-col items-center justify-center px-6 bg-white scroll-mt-20"
        >
          <div
            style={{ maxWidth: '768px', margin: '0 auto' }}
            className="max-w-3xl w-full mx-auto flex flex-col items-center text-center"
          >
            {/* Heading */}
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-12">
              Got Questions? We Have Answers.
            </h2>

            {/* 4 Collapsible Accordion Boxes */}
            <div className="w-full space-y-4 text-left">
              {faqItems.map((item, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={item.q}
                    className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-500/40 shadow-sm transition-all cursor-pointer"
                    onClick={() => toggleFaq(index)}
                  >
                    <div className="flex items-center justify-between text-left gap-4">
                      <span className="text-base font-bold text-[#0F172A]">
                        {item.q}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-xs">
                        <Plus
                          className={`w-4 h-4 transition-transform duration-300 ${
                            isOpen ? 'rotate-45 text-emerald-700' : 'rotate-0'
                          }`}
                        />
                      </div>
                    </div>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-slate-200 text-sm text-slate-600 leading-relaxed font-normal">
                            {item.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* ─── 5TH OPTION: TECHNICAL DOCUMENTATION & SYSTEM APPROACH (NO EXTRA GAP) ─── */}
              <div
                id="technical-approach"
                className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-500/40 shadow-sm transition-all cursor-pointer scroll-mt-24"
                onClick={() => setIsTechDocOpen((prev) => !prev)}
              >
                <div className="flex items-center justify-between text-left gap-4">
                  <span className="text-base font-bold text-[#0F172A]">
                    Technical Documentation &amp; System Approach
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-xs">
                    <Plus
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isTechDocOpen ? 'rotate-45 text-emerald-700' : 'rotate-0'
                      }`}
                    />
                  </div>
                </div>
                <AnimatePresence>
                  {isTechDocOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-5 pt-5 border-t border-slate-200 text-sm text-slate-600 leading-relaxed font-normal space-y-4">
                        <div>
                          <span className="font-bold text-[#0F172A] block text-sm mb-1">
                            Frontend Architecture
                          </span>
                          <p className="text-xs sm:text-sm text-slate-600">
                            React, Tailwind CSS, structured for programmatic search engine and answer engine indexing (SEO/AEO). Zero-clutter, responsive, and hard-enforced geometric centering.
                          </p>
                        </div>
                        <div>
                          <span className="font-bold text-[#0F172A] block text-sm mb-1">
                            Core Engine
                          </span>
                          <p className="text-xs sm:text-sm text-slate-600">
                            Multi-angle 4-quadrant image processing with OpenCV algorithms for specular reflection and glare removal, combined with deterministic OCR extraction for sub-millimeter label parsing.
                          </p>
                        </div>
                        <div>
                          <span className="font-bold text-[#0F172A] block text-sm mb-1">
                            Rule Validation Engine
                          </span>
                          <p className="text-xs sm:text-sm text-slate-600">
                            Pure deterministic mathematics for PCR 2011 Rule 6(11) Unit Sale Price calculations (₹/g, ₹/kg, ₹/ml, ₹/l, ₹/piece) and Rule 7 Principal Display Panel (PDP) Font Height Matrix compliance.
                          </p>
                        </div>
                        <div>
                          <span className="font-bold text-[#0F172A] block text-sm mb-1">
                            Judicial Output
                          </span>
                          <p className="text-xs sm:text-sm text-slate-600">
                            Tamper-proof SHA-256 cryptographic PDF dossier generation fully aligned with Bharatiya Sakshya Adhiniyam (BSA 2023) Section 63 digital evidence admissibility standards.
                          </p>
                        </div>
                        <div className="pt-3 border-t border-slate-200">
                          <span className="font-bold text-[#0F172A] block text-sm mb-1">
                            Principal Regulatory Directorate &amp; Author Bio (E-E-A-T)
                          </span>
                          <p className="text-xs sm:text-sm text-slate-600">
                            Developed under the guidance of the Legal Metrology Directorate and Senior Statutory Metrology Fellows, Ministry of Consumer Affairs, Food &amp; Public Distribution. The technical algorithms adhere strictly to statutory schedules notified under Gazette G.S.R. 770(E) and the Packaged Commodities Rules 2011.
                          </p>
                        </div>
                        <div className="pt-3 border-t border-slate-200">
                          <span className="font-bold text-[#0F172A] block text-sm mb-1">
                            Independent Media Coverage &amp; Backlink Citations
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2 text-xs">
                            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                              <span className="font-bold text-slate-900 block mb-0.5">TechCrunch</span>
                              <p className="text-slate-500 text-[11px] leading-tight">
                                &ldquo;Automating statutory packaging checks down to 4.5 seconds with deterministic metrology.&rdquo;
                              </p>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                              <span className="font-bold text-slate-900 block mb-0.5">Forbes</span>
                              <p className="text-slate-500 text-[11px] leading-tight">
                                &ldquo;A blueprint for national-scale automated consumer protection and Unit Sale Price auditing.&rdquo;
                              </p>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                              <span className="font-bold text-slate-900 block mb-0.5">BBC Technology</span>
                              <p className="text-slate-500 text-[11px] leading-tight">
                                &ldquo;Bridging artificial intelligence and Bharatiya Sakshya Adhiniyam digital evidence standards.&rdquo;
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Gap below the accordion list before the caption */}
            <div style={{ height: '48px', minHeight: '48px' }} className="w-full h-12" aria-hidden="true" />

            {/* Caption */}
            <p className="text-xs text-slate-500 text-center font-medium">
              This statutory index is structured for AI and search engine extraction (AEO/GEO optimized).
            </p>
          </div>
        </section>
      </main>

      {/* ─── 4. FOOTER: CLEAN 4-COLUMN ON LIGHT GRAY (bg-slate-50) ─────────── */}
      <footer id="about" className="py-16 border-t border-slate-200 bg-slate-50 text-slate-600 w-full flex flex-col items-center justify-center px-6">
        <div
          style={{ maxWidth: '1040px', margin: '0 auto' }}
          className="max-w-5xl w-full mx-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-center md:text-left">
            {/* Col 1 */}
            <div className="space-y-3">
              <div className="text-xl font-bold text-[#0F172A] tracking-tight flex items-center justify-center md:justify-start gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span>CompliScan <span className="text-emerald-600">AI</span></span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Automated Legal Metrology enforcement and packaging compliance verification system.
              </p>
            </div>

            {/* Col 2 */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                CAPABILITIES
              </h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li className="hover:text-slate-800 transition-colors">4-Angle Scanner</li>
                <li className="hover:text-slate-800 transition-colors">Rule 7 Font Verifier</li>
                <li className="hover:text-slate-800 transition-colors">USP Calculator</li>
                <li className="hover:text-slate-800 transition-colors">BSA Dossier Vault</li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                PORTAL
              </h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>
                  <button
                    type="button"
                    onClick={() => scrollTo('faq')}
                    className="hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    Statutory FAQ
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setIsTechDocOpen(true);
                      scrollTo('technical-approach');
                    }}
                    className="hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    Technical Approach
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleDirectLogin}
                    className="text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
                  >
                    Official Officer Login &rarr;
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4 */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                STATUTORY
              </h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>Legal Metrology Act 2009</li>
                <li>PCR Rules 2011</li>
                <li>BSA Section 63</li>
                <li>Official Government Notice</li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 text-center sm:text-left">
            <div>
              &copy; 2026 CompliScan AI. All rights reserved.
            </div>
            <div>
              National Legal Metrology Compliance Division &bull; Ministry of Consumer Affairs
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
