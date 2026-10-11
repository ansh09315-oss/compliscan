'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';

export default function ComplianceMetadataFooter() {
  const { currentScreen } = useAppStore();
  const isDark = currentScreen === 'login' || currentScreen === 'ai-processing' || currentScreen === 'camera-hud';

  // State to track which sections are currently expanded
  // Default is empty: NO CONTENT SHOWN, ALL CONTENT HIDDEN BEHIND THOSE WORDS
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const statutoryRules = [
    {
      provision: 'Rule 6(1)(a)',
      subject: 'Generic Commodity Identity',
      standard: 'Prominent declaration of common or generic commodity name on Principal Display Panel (PDP).',
      statute: 'PCR 2011',
      protocol: 'Token extraction and common trade dictionary validation'
    },
    {
      provision: 'Rule 6(1)(b)',
      subject: 'Net Quantity Metric Standard',
      standard: 'Standard units (g, kg, ml, l, no.) without non-metric prefixes or illegal symbols.',
      statute: 'PCR 2011',
      protocol: 'Deterministic unit parsing and metric unit whitelist'
    },
    {
      provision: 'Rule 6(1)(c)',
      subject: 'Maximum Retail Price (MRP)',
      standard: 'Inclusive of all taxes in prescribed format: "MRP Rs. / ₹ xx.xx incl. of all taxes".',
      statute: 'PCR 2011',
      protocol: 'Currency token regex and tax inclusive suffix verification'
    },
    {
      provision: 'Rule 6(1)(d)',
      subject: 'Month & Year of Manufacture',
      standard: 'Clear MM/YYYY or Month YYYY pre-pack timestamp format.',
      statute: 'PCR 2011',
      protocol: 'Temporal regex parsing and date consistency logic'
    },
    {
      provision: 'Rule 6(11)',
      subject: 'Unit Sale Price (USP)',
      standard: 'Mandatory price per gram or per millilitre for multi-unit and bulk packages.',
      statute: '2022 Amendment',
      protocol: 'Mathematical audit: (Total MRP divided by Net Quantity)'
    },
    {
      provision: 'Rule 6(1)(e)',
      subject: 'Manufacturer & Packer Details',
      standard: 'Complete legal entity name, street address, and valid postal PIN code.',
      statute: 'PCR 2011',
      protocol: 'Entity address structure verification and PIN database check'
    },
    {
      provision: 'Rule 6(1)(g)',
      subject: 'Country of Origin',
      standard: 'Explicit origin declaration for both domestic production and imported packages.',
      statute: 'PCR 2011',
      protocol: 'ISO 3166-1 country name verification'
    },
    {
      provision: 'Rule 6(1)(n)',
      subject: 'Consumer Grievance Helpline',
      standard: 'Designated executive name/office, contact telephone number, and email address.',
      statute: 'PCR 2011',
      protocol: 'Telephone digit length and RFC 5322 email syntax validation'
    },
    {
      provision: 'Rule 7 & Sch. I',
      subject: 'Minimum Numeral & Font Height',
      standard: 'Area-calibrated minimum numeral height in millimetres per packaging PDP area.',
      statute: 'Schedule I, PCR 2011',
      protocol: 'Computer vision bounding box calibration to package dimensions'
    },
    {
      provision: 'Sec. 63 BSA 2023',
      subject: 'Digital Evidence Integrity',
      standard: 'Cryptographic hash sealing ensuring admissibility under Indian Evidence Law.',
      statute: 'BSA 2023',
      protocol: 'SHA-256 binary hash generation and immutable timestamp stamp'
    }
  ];

  // Section Accordion Component
  const AccordionItem = ({
    id,
    title,
    subtitle,
    children
  }: {
    id: string;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
  }) => {
    const isExpanded = expandedSections.includes(id);

    return (
      <div
        style={{
          border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid var(--card-border)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          marginBottom: '8px',
          background: isDark ? 'rgba(11, 37, 69, 0.75)' : 'var(--card-bg)',
          transition: 'border-color 0.15s ease',
        }}
      >
        {/* Clickable Section Title Bar ("THOSE WORDS") */}
        <button
          type="button"
          onClick={() => toggleSection(id)}
          style={{
            width: '100%',
            textAlign: 'left',
            padding: '14px 18px',
            background: isDark
              ? (isExpanded ? 'rgba(19, 49, 92, 0.9)' : 'rgba(11, 37, 69, 0.75)')
              : (isExpanded ? 'rgba(29, 78, 216, 0.04)' : 'var(--card-bg)'),
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            color: isDark ? '#FFFFFF' : 'var(--text-primary)',
            outline: 'none',
          }}
          aria-expanded={isExpanded}
        >
          <div>
            <div style={{
              fontSize: '13px',
              fontWeight: 700,
              color: isDark ? '#FFFFFF' : 'var(--text-primary)',
              letterSpacing: '0.01em',
            }}>
              {title}
            </div>
            {subtitle && (
              <div style={{
                fontSize: '11px',
                marginTop: '2px',
                color: isDark ? 'rgba(255, 255, 255, 0.65)' : 'var(--text-secondary)',
              }}>
                {subtitle}
              </div>
            )}
          </div>
          <div style={{ flexShrink: 0 }}>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: isDark ? '1px solid rgba(212, 175, 55, 0.35)' : '1px solid var(--card-border)',
                background: isDark ? 'rgba(212, 175, 55, 0.15)' : 'var(--slate-bg)',
                color: isDark ? '#D4AF37' : 'var(--text-primary)',
              }}
            >
              {isExpanded ? '[-] Hide Content' : '[+] Click to View'}
            </span>
          </div>
        </button>

        {/* Content Hidden Behind Those Words until clicked */}
        {isExpanded && (
          <div
            style={{
              padding: '16px 18px',
              borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--card-border)',
              background: isDark ? 'rgba(6, 21, 41, 0.85)' : 'var(--slate-bg)',
              color: isDark ? 'rgba(255, 255, 255, 0.85)' : 'var(--text-secondary)',
              fontSize: '12px',
              lineHeight: 1.6,
            }}
          >
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        width: '100%',
        background: isDark ? 'transparent' : 'var(--slate-bg)',
        color: isDark ? '#FFFFFF' : 'var(--text-primary)',
        borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--card-border)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px 20px',
        }}
      >
        {/* SECTION 1: ABOUT & SCOPE OF SCREENING (ALL 10 POINTS) */}
        <AccordionItem
          id="about-screening"
          title="About CompliScan &amp; Scope of Screening (10 Statutory Rules Matrix)"
          subtitle="Click to view the 10 automated screening rules under the Legal Metrology Act, 2009 &amp; PCR 2011"
        >
          <div style={{ marginBottom: '14px', color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'var(--text-primary)', fontSize: '12px' }}>
            CompliScan evaluates packaging declarations against deterministic rule engines and Legal Metrology standards. Below is the active specification matrix screened across each captured panel.
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '10px',
            }}
          >
            {statutoryRules.map((rule, idx) => (
              <div
                key={idx}
                style={{
                  background: isDark ? 'rgba(19, 49, 92, 0.7)' : 'var(--card-bg)',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid var(--card-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-sm)',
                        background: isDark ? 'rgba(212, 175, 55, 0.2)' : 'rgba(29, 78, 216, 0.08)',
                        color: isDark ? '#D4AF37' : 'var(--primary-blue)',
                        border: isDark ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(29, 78, 216, 0.2)',
                      }}
                    >
                      {rule.provision}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {rule.statute}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: isDark ? '#FFFFFF' : 'var(--text-primary)',
                      marginBottom: '4px',
                    }}
                  >
                    {rule.subject}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: isDark ? 'rgba(255, 255, 255, 0.75)' : 'var(--text-secondary)',
                      lineHeight: 1.5,
                    }}
                  >
                    {rule.standard}
                  </div>
                </div>
                <div
                  style={{
                    paddingTop: '6px',
                    borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid var(--card-border)',
                    fontSize: '10px',
                    color: isDark ? '#D4AF37' : 'var(--primary-blue)',
                    fontWeight: 500,
                  }}
                >
                  Protocol: {rule.protocol}
                </div>
              </div>
            ))}
          </div>
        </AccordionItem>

        {/* SECTION 2: STATUTORY ADVISORY NOTICE: LEGAL METROLOGY ACT, 2009 */}
        <AccordionItem
          id="statutory-notice"
          title="Statutory Advisory Notice: Legal Metrology Act, 2009"
          subtitle="Non-affiliation notice, regulatory scope under Section 15 &amp; Section 36"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p>
              <strong>CompliScan</strong> is an automated regulatory screening system designed for pre-enforcement audit and internal quality verification of packaged commodities. This system is independent software and does not constitute an official statutory portal of the Ministry of Consumer Affairs, Food and Public Distribution, Government of India.
            </p>
            <p>
              All optical character recognitions, numeral height calculations under Rule 7, and unit sale price derivations under Rule 6(11) are computational evaluations. Formal compounding proceedings, search and seizure notices, and penalty determinations remain under the exclusive statutory authority of designated Legal Metrology Officers under Section 15 and Section 36 of the Legal Metrology Act, 2009.
            </p>
          </div>
        </AccordionItem>

        {/* SECTION 3: OFFICIAL PORTALS & GAZETTE AUTHORITIES */}
        <AccordionItem
          id="official-portals"
          title="Official Portals &amp; Gazette Authorities"
          subtitle="Direct links to Department of Consumer Affairs, e-Metrology portal, and consumer grievance networks"
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '10px',
            }}
          >
            <div
              style={{
                background: isDark ? 'rgba(19, 49, 92, 0.7)' : 'var(--card-bg)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid var(--card-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
              }}
            >
              <div style={{ fontWeight: 700, color: isDark ? '#FFFFFF' : 'var(--text-primary)' }}>
                Department of Consumer Affairs
              </div>
              <div style={{ fontSize: '11px', color: isDark ? 'rgba(255, 255, 255, 0.65)' : 'var(--text-secondary)', marginTop: '2px' }}>
                Government of India, Krishi Bhawan, New Delhi
              </div>
              <a
                href="https://consumeraffairs.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  marginTop: '8px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  color: isDark ? '#D4AF37' : 'var(--primary-blue)',
                  textDecoration: 'underline',
                }}
              >
                https://consumeraffairs.gov.in [Official Portal]
              </a>
            </div>

            <div
              style={{
                background: isDark ? 'rgba(19, 49, 92, 0.7)' : 'var(--card-bg)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid var(--card-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
              }}
            >
              <div style={{ fontWeight: 700, color: isDark ? '#FFFFFF' : 'var(--text-primary)' }}>
                Legal Metrology Division (e-Metrology)
              </div>
              <div style={{ fontSize: '11px', color: isDark ? 'rgba(255, 255, 255, 0.65)' : 'var(--text-secondary)', marginTop: '2px' }}>
                National Metrology Registry &amp; Guidelines
              </div>
              <a
                href="https://e-metrology.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  marginTop: '8px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  color: isDark ? '#D4AF37' : 'var(--primary-blue)',
                  textDecoration: 'underline',
                }}
              >
                https://e-metrology.gov.in [National Registry]
              </a>
            </div>

            <div
              style={{
                background: isDark ? 'rgba(19, 49, 92, 0.7)' : 'var(--card-bg)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid var(--card-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
              }}
            >
              <div style={{ fontWeight: 700, color: isDark ? '#FFFFFF' : 'var(--text-primary)' }}>
                National Consumer Helpline
              </div>
              <div style={{ fontSize: '11px', color: isDark ? 'rgba(255, 255, 255, 0.65)' : 'var(--text-secondary)', marginTop: '2px' }}>
                Toll-Free Redressal Network (Dial 1915)
              </div>
              <a
                href="https://consumerhelpline.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  marginTop: '8px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  color: isDark ? '#D4AF37' : 'var(--primary-blue)',
                  textDecoration: 'underline',
                }}
              >
                https://consumerhelpline.gov.in [Grievance 1915]
              </a>
            </div>
          </div>
        </AccordionItem>

        {/* SECTION 4: REGULATORY STANDARDS */}
        <AccordionItem
          id="regulatory-standards"
          title="Regulatory Standards"
          subtitle="Legal Metrology Act, 2009, Packaged Commodities Rules 2011 &amp; BSA 2023 Section 63"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <div style={{ fontWeight: 700, color: isDark ? '#FFFFFF' : 'var(--text-primary)' }}>
                Legal Metrology Act, 2009 (Act No. 1 of 2010)
              </div>
              <div style={{ fontSize: '11px', color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'var(--text-secondary)' }}>
                Primary parliamentary legislation governing standard weights, measures, pre-packaged goods verification, and legal compounding enforcement throughout the Republic of India.
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: isDark ? '#FFFFFF' : 'var(--text-primary)' }}>
                Legal Metrology (Packaged Commodities) Rules, 2011
              </div>
              <div style={{ fontSize: '11px', color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'var(--text-secondary)' }}>
                Codified framework defining mandatory packaging declarations, Principal Display Panel surface boundaries, numeral/letter height minimums, and net weight tolerance schedules.
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: isDark ? '#FFFFFF' : 'var(--text-primary)' }}>
                Gazette Notification G.S.R. 770(E) (2022 Amendment)
              </div>
              <div style={{ fontSize: '11px', color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'var(--text-secondary)' }}>
                Mandatory Unit Sale Price (USP) declaration per gram or millilitre on all pre-packed retail packaging to prevent disguised consumer price inflation.
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: isDark ? '#FFFFFF' : 'var(--text-primary)' }}>
                Section 63, Bharatiya Sakshya Adhiniyam, 2023 (BSA)
              </div>
              <div style={{ fontSize: '11px', color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'var(--text-secondary)' }}>
                Statutory protocol for electronic records admissibility, requiring unalterable cryptographic hashing (SHA-256) and tamper-evident metadata sealing for legal courtroom evidence.
              </div>
            </div>
          </div>
        </AccordionItem>

        {/* SECTION 5: TERMS OF USE & INSPECTION CONDITIONS */}
        <AccordionItem
          id="terms-conditions"
          title="Terms of Use &amp; Inspection Conditions"
          subtitle="Conditions of diagnostic software use, non-finality, and user responsibilities"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <div style={{ fontWeight: 700, color: isDark ? '#FFFFFF' : 'var(--text-primary)' }}>1. Nature of the Service</div>
              <div style={{ fontSize: '11px' }}>
                CompliScan is an algorithmic pre-screening utility for preliminary diagnostic audits, manufacturer self-checks, and enforcement workflow assistance under the Legal Metrology (Packaged Commodities) Rules, 2011.
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: isDark ? '#FFFFFF' : 'var(--text-primary)' }}>2. Statutory Prerogative and Non-Finality</div>
              <div style={{ fontSize: '11px' }}>
                Algorithmic evaluations and character height calculations do not constitute judicial compounding orders or statutory summons. Regulatory citations remain under the exclusive prerogative of designated Legal Metrology Officers under Section 15 of the Act.
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: isDark ? '#FFFFFF' : 'var(--text-primary)' }}>3. User Responsibility</div>
              <div style={{ fontSize: '11px' }}>
                Users submitting packaging imagery represent that they possess legitimate authority to audit the pre-packaged commodities. Captures must have adequate resolution and lighting for optical verification.
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: isDark ? '#FFFFFF' : 'var(--text-primary)' }}>4. Limitation of Liability</div>
              <div style={{ fontSize: '11px' }}>
                The development team and associated institutions shall not be held liable for statutory compounding fines or legal disputes resulting from operational reliance on autonomous scan outputs.
              </div>
            </div>
          </div>
        </AccordionItem>

        {/* SECTION 6: PRIVACY & JUDICIAL EVIDENCE POLICY */}
        <AccordionItem
          id="privacy-policy"
          title="Privacy &amp; Judicial Evidence Policy"
          subtitle="Data retention, electronic record chain of custody under BSA 2023, and officer audit logs"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <div style={{ fontWeight: 700, color: isDark ? '#FFFFFF' : 'var(--text-primary)' }}>1. Electronic Records Retention</div>
              <div style={{ fontSize: '11px' }}>
                In accordance with Section 63 of the Bharatiya Sakshya Adhiniyam, 2023, inspection dossiers are sealed with SHA-256 cryptographic hashes to ensure judicial admissibility and prevent post-inspection tampering.
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: isDark ? '#FFFFFF' : 'var(--text-primary)' }}>2. Packaging Imagery and Metadata</div>
              <div style={{ fontSize: '11px' }}>
                Uploaded packaging images are processed strictly for optical declaration analysis and verification dossier generation. No personal consumer data is captured during commodity scans.
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: isDark ? '#FFFFFF' : 'var(--text-primary)' }}>3. Officer Authentication &amp; Audit Logs</div>
              <div style={{ fontSize: '11px' }}>
                Inspector badge identifiers, session timestamps, and district authorizations are maintained in an immutable ledger for administrative compliance verification.
              </div>
            </div>
          </div>
        </AccordionItem>

        {/* SECTION 7: WEBSITE POLICIES (GIGW GUIDELINES) */}
        <AccordionItem
          id="website-policies"
          title="Website Policies (GIGW Guidelines)"
          subtitle="Hyperlinking policies, copyright, and Guidelines for Indian Government Websites compliance"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <div style={{ fontWeight: 700, color: isDark ? '#FFFFFF' : 'var(--text-primary)' }}>1. Hyperlinking Policy</div>
              <div style={{ fontSize: '11px' }}>
                Prior authorization is not required to link directly to this platform, provided links open directly in a new browser window without framing on external websites.
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: isDark ? '#FFFFFF' : 'var(--text-primary)' }}>2. Copyright &amp; Fair Use</div>
              <div style={{ fontSize: '11px' }}>
                Statutory screening parameters and schedules may be cited for non-commercial research and regulatory compliance purposes with proper attribution to the Legal Metrology Division.
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: isDark ? '#FFFFFF' : 'var(--text-primary)' }}>3. GIGW &amp; Accessibility Compliance</div>
              <div style={{ fontSize: '11px' }}>
                This portal is engineered to conform with Guidelines for Indian Government Websites (GIGW 3.0) and ISO/IEC 27001 data protection protocols.
              </div>
            </div>
          </div>
        </AccordionItem>
      </div>

      {/* MINIMAL FOOTER ATTRIBUTION BAR */}
      <footer
        style={{
          width: '100%',
          background: isDark ? 'rgba(6, 21, 41, 0.95)' : 'var(--navy)',
          color: 'rgba(255, 255, 255, 0.65)',
          padding: '16px 20px',
          fontSize: '11px',
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid var(--navy-dark)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div>
            <span style={{ color: '#D4AF37', fontWeight: 700 }}>CompliScan AI</span> : Legal Metrology Compliance Inspection Platform (SIH 26034)
          </div>
          <div>
            &copy; 2026 Legal Metrology Verification System. Guidelines for Indian Government Websites (GIGW) Compliant.
          </div>
        </div>
      </footer>
    </div>
  );
}
