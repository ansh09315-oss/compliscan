import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home, Lock, HelpCircle, FileText } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-[#0F172A] font-sans flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header Bar */}
      <header className="w-full border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group select-none">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0F172A] rounded-[9px] flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#0F172A]">
              CompliScan <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">AI</span>
            </span>
          </Link>

          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            HTTP 404 &bull; Resource Status
          </span>
        </div>
      </header>

      {/* Main 404 Hero */}
      <main className="w-full flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="max-w-xl mx-auto flex flex-col items-center">
          {/* Status Badge */}
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-6 shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold uppercase tracking-widest text-slate-600 mb-4">
            Statutory Dossier Not Located
          </div>

          {/* Primary Semantic H1 */}
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#0F172A] mb-4">
            404 — Dossier Not Found
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-md">
            The regulatory file, inspection link, or jurisdiction URL you attempted to access does not exist in the Legal Metrology national registry or has been sealed.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Return to Public Portal</span>
            </Link>

            <Link
              href="/#faq"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-semibold text-sm border border-slate-200 transition-all flex items-center justify-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-slate-600" />
              <span>Statutory FAQ</span>
            </Link>
          </div>

          {/* Quick Helpful Directory */}
          <div className="mt-12 pt-8 border-t border-slate-200 w-full grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <Link
              href="/#about"
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500/40 bg-slate-50/50 hover:bg-white transition-all group"
            >
              <div className="text-xs font-bold text-[#0F172A] group-hover:text-emerald-700 flex items-center gap-1.5 mb-1">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>About System</span>
              </div>
              <p className="text-xs text-slate-500 leading-snug">
                Overview of Legal Metrology Act 2009 verification.
              </p>
            </Link>

            <Link
              href="/#technical-approach"
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500/40 bg-slate-50/50 hover:bg-white transition-all group"
            >
              <div className="text-xs font-bold text-[#0F172A] group-hover:text-emerald-700 flex items-center gap-1.5 mb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                <span>Technical Core</span>
              </div>
              <p className="text-xs text-slate-500 leading-snug">
                PCR 2011 Rule 6(11) &amp; Rule 7 mathematical specifications.
              </p>
            </Link>

            <Link
              href="/"
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500/40 bg-slate-50/50 hover:bg-white transition-all group"
            >
              <div className="text-xs font-bold text-[#0F172A] group-hover:text-emerald-700 flex items-center gap-1.5 mb-1">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Officer Portal</span>
              </div>
              <p className="text-xs text-slate-500 leading-snug">
                Authorized inspector login and evidence vault.
              </p>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-slate-50 py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 CompliScan AI &bull; Ministry of Consumer Affairs</span>
          <span>Packaged Commodities Rules (PCR 2011) Enforcement Division</span>
        </div>
      </footer>
    </div>
  );
}
