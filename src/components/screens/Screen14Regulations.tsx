'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { ArrowLeft, BookOpen, ChevronDown, ChevronRight, Search, Scale } from 'lucide-react';

const REGULATIONS = [
  {
    id: 'rule6',
    title: 'Rule 6 — Declarations on Pre-Packaged Commodities',
    sections: [
      {
        id: 'rule6_1a',
        title: 'Rule 6(1)(a) — Manufacturer/Packer Name & Address',
        content: `Every package shall bear on it the name and complete address of the manufacturer, or where the manufacturer is not the packer, the name and address of the manufacturer and the packer.\n\nThe address must include:\n• Legal entity name of the manufacturer or packer\n• Street address or factory location\n• City/Town name\n• State/Territory\n• 6-digit PIN Code\n\nFor imported goods, the name and address of the importer shall also be mentioned.`,
      },
      {
        id: 'rule6_2',
        title: 'Rule 6(2) — Consumer Care Information',
        content: `Every pre-packaged commodity shall bear the following consumer redressal information:\n\n• A valid customer care phone number (Indian mobile: +91/0 followed by 10 digits starting with 6-9, or toll-free: 1800XXXXXX to 1800XXXXXXXX)\n• A valid email address for consumer complaints\n\nBoth must be prominently displayed and easily readable on the packaging.`,
      },
      {
        id: 'rule6_11',
        title: 'Rule 6(11) — Unit Sale Price (USP)',
        content: `Every retail package shall declare the Unit Sale Price (USP) in addition to the MRP.\n\nCalculation Rules:\n• For weight (grams < 1000): USP = MRP ÷ Net Qty (₹ per g)\n• For weight (grams ≥ 1000 or kg): USP = MRP ÷ (Net Qty in kg) (₹ per kg)\n• For volume (ml < 1000): USP = MRP ÷ Net Qty (₹ per ml)\n• For volume (ml ≥ 1000 or l): USP = MRP ÷ (Net Qty in l) (₹ per l)\n• For count-based: USP = MRP ÷ Number of pieces (₹ per piece)\n\nTolerable discrepancy: |Declared USP − Calculated USP| ≤ ₹0.05\nAny discrepancy exceeding ₹0.05 is a HIGH severity violation.`,
      },
    ],
  },
  {
    id: 'rule7',
    title: 'Rule 7 — Principal Display Panel & Font Requirements',
    sections: [
      {
        id: 'rule7_pdp',
        title: 'Rule 7 — PDP Area Calculation',
        content: `The Principal Display Panel (PDP) area determines minimum font height requirements.\n\nCalculation by packaging geometry:\n• Rectangular/Square: PDP Area = Height (mm) × Width (mm) ÷ 100 (cm²)\n• Cylindrical: PDP Area = 0.40 × Height (mm) × Circumference (mm) ÷ 100 (cm²)\n• Flexible Pouch: PDP Area = Height (mm) × Width (mm) ÷ 100 (cm²)\n\nThe PDP is the panel most likely to be seen by the consumer at the time of purchase.`,
      },
      {
        id: 'rule7_font',
        title: 'Rule 7 — Minimum Font Height Matrix',
        content: `Based on the calculated PDP area, the minimum font height for mandatory declarations:\n\n| PDP Area (cm²)    | Min Font Height (mm) |\n|-------------------|---------------------|\n| ≤ 50              | 1.0                 |\n| 50 < A ≤ 100      | 1.5                 |\n| 100 < A ≤ 500     | 2.5                 |\n| 500 < A ≤ 2500    | 4.0                 |\n| > 2500            | 6.0                 |\n\nThis applies to all mandatory declarations including net quantity, MRP, manufacturing date, and other statutory information.`,
      },
    ],
  },
  {
    id: 'rule8',
    title: 'Rule 8 — Country of Origin',
    sections: [
      {
        id: 'rule8_coo',
        title: 'Rule 8 — Country of Origin Declaration',
        content: `Every pre-packaged commodity, whether manufactured domestically or imported, shall bear a declaration of the country of origin.\n\nFor goods manufactured in India: "Country of Origin: India" or "Made in India"\nFor imported goods: The country where the goods were manufactured shall be declared clearly.\n\nThis declaration must be printed in a conspicuous manner and must comply with the font size requirements of Rule 7.`,
      },
    ],
  },
  {
    id: 'rule11',
    title: 'Rule 11 — Net Quantity & Standard Packages',
    sections: [
      {
        id: 'rule11_netqty',
        title: 'Rule 11 — Standard Net Quantity Declaration',
        content: `The net quantity of a commodity in a pre-packaged form shall be declared:\n\n• By weight for solid commodities (grams or kilograms)\n• By volume or measure for liquid commodities (milliliters or liters)\n• By number or count for piece-based commodities\n\nThe declaration must use standard SI units and comply with the Legal Metrology (National Standards) Rules.`,
      },
    ],
  },
  {
    id: 'section36',
    title: 'Section 36 — Penalties',
    sections: [
      {
        id: 'section36_penalties',
        title: 'Section 36 — Penalty Provisions under Legal Metrology Act, 2009',
        content: `Violations of the Legal Metrology Act and associated rules attract the following penalties:\n\n• First Offence: Fine which may extend to ₹25,000\n• Second Offence: Fine which may extend to ₹50,000\n• Subsequent Offence: Fine which may extend to ₹1,00,000 or imprisonment up to 1 year, or both\n\nFor companies: Every person who was in charge of the company at the time of the offence shall be deemed guilty and shall be liable to be proceeded against and punished.\n\nFor continuing offences: An additional fine of ₹2,000 per day during which the offence continues after conviction.`,
      },
    ],
  },
];

export default function Screen14Regulations() {
  const { setScreen } = useAppStore();
  const [expandedRules, setExpandedRules] = useState<string[]>(['rule6']);
  const [expandedSections, setExpandedSections] = useState<string[]>(['rule6_1a']);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleRule = (id: string) => {
    setExpandedRules((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const filteredRegs = searchQuery
    ? REGULATIONS.filter((r) =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.sections.some(
          (s) =>
            s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : REGULATIONS;

  return (
    <div className="screen-container" style={{ animation: 'fade-in-up 0.4s ease-out' }}>
      <button className="gov-btn gov-btn-ghost" onClick={() => setScreen('dashboard')} style={{ marginBottom: '16px' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <Scale size={24} color="var(--emblem-gold)" />
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Legal Regulations</h1>
      </div>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
        Statutory reference for Legal Metrology Act, 2009 & Packaged Commodities Rules
      </p>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          className="gov-input"
          placeholder="Search regulations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: '36px' }}
        />
      </div>

      {/* Accordion */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredRegs.map((reg) => (
          <div key={reg.id} className="gov-card" style={{ overflow: 'hidden' }}>
            <button
              onClick={() => toggleRule(reg.id)}
              style={{
                width: '100%',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: expandedRules.includes(reg.id) ? 'rgba(29, 78, 216, 0.04)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BookOpen size={18} color="var(--primary-blue)" />
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{reg.title}</span>
              </div>
              {expandedRules.includes(reg.id) ? (
                <ChevronDown size={18} color="var(--text-muted)" />
              ) : (
                <ChevronRight size={18} color="var(--text-muted)" />
              )}
            </button>

            {expandedRules.includes(reg.id) && (
              <div style={{ borderTop: '1px solid var(--card-border)' }}>
                {reg.sections.map((section) => (
                  <div key={section.id}>
                    <button
                      onClick={() => toggleSection(section.id)}
                      style={{
                        width: '100%',
                        padding: '12px 20px 12px 48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: expandedSections.includes(section.id) ? 'var(--slate-bg)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        borderBottom: '1px solid var(--card-border)',
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{section.title}</span>
                      {expandedSections.includes(section.id) ? (
                        <ChevronDown size={14} color="var(--text-muted)" />
                      ) : (
                        <ChevronRight size={14} color="var(--text-muted)" />
                      )}
                    </button>
                    {expandedSections.includes(section.id) && (
                      <div style={{
                        padding: '16px 20px 16px 48px',
                        fontSize: '13px',
                        lineHeight: 1.7,
                        color: 'var(--text-secondary)',
                        whiteSpace: 'pre-line',
                        background: '#FAFBFC',
                      }}>
                        {section.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
