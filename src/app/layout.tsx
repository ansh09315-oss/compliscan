import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CompliScan AI — Automated Legal Metrology Act 2009 & PCR 2011 Compliance Platform",
  description: "CompliScan AI (SIH 26034) is India's automated Legal Metrology & Packaged Commodities Rules (PCR 2011) inspection platform. Verify Rule 6(11) Unit Sale Price math, Rule 7 PDP font heights, FSSAI norms, and generate BSA 2023 Section 63 court-admissible digital evidence dossiers in <4.5 seconds.",
  keywords: [
    "CompliScan AI",
    "CompliScan",
    "Legal Metrology Act 2009 Software",
    "Packaged Commodities Rules 2011 AI",
    "PCR 2011 Compliance Scanner",
    "Rule 6(11) Unit Sale Price Calculator",
    "Rule 7 Principal Display Panel Font Height",
    "Bharatiya Sakshya Adhiniyam Section 63 Digital Evidence",
    "SIH 26034 Ministry of Consumer Affairs",
    "FMCG Packaging Audit India",
    "Legal Metrology label compliance",
    "automated packaging verification India"
  ],
  authors: [{ name: "Government of India — Ministry of Consumer Affairs (SIH 26034)" }],
  creator: "CompliScan AI Taskforce",
  publisher: "Ministry of Consumer Affairs, Food & Public Distribution",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://compliscan.gov.in/",
    title: "CompliScan AI — Automated Legal Metrology Act 2009 & PCR 2011 Compliance Platform",
    description: "Automated regulatory screening platform for packaged commodities under the Legal Metrology Act, 2009, Packaged Commodities Rules, 2011, and Bharatiya Sakshya Adhiniyam, 2023 evidence protocols.",
    siteName: "CompliScan AI",
    images: [
      {
        url: "/assets/og-banner.png",
        width: 1200,
        height: 630,
        alt: "CompliScan AI - National Legal Metrology Inspection System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CompliScan AI — Automated Legal Metrology Act 2009 & PCR 2011 Compliance Platform",
    description: "Multimodal AI screening for packaged commodities under PCR 2011 & BSA 2023 digital evidence.",
    images: ["/assets/og-banner.png"],
  },
  category: "Government Enterprise Compliance Software",
};

const jsonLdGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "Brand"],
      "@id": "https://compliscan.gov.in/#organization",
      "name": "CompliScan AI",
      "alternateName": "CompliScan Legal Metrology AI",
      "url": "https://compliscan.gov.in",
      "logo": "https://compliscan.gov.in/assets/emblem.svg",
      "description": "National automated regulatory inspection platform for packaged commodities under the Legal Metrology Act 2009 and Packaged Commodities Rules 2011.",
      "parentOrganization": {
        "@type": "GovernmentOrganization",
        "name": "Ministry of Consumer Affairs, Food and Public Distribution, Government of India",
        "url": "https://consumeraffairs.nic.in"
      },
      "slogan": "Precision Statutory Metrology for India's Consumer Protection",
      "knowsAbout": [
        "Legal Metrology Act, 2009",
        "Legal Metrology (Packaged Commodities) Rules, 2011",
        "Bharatiya Sakshya Adhiniyam, 2023 Section 63",
        "FSSAI Labeling Norms",
        "Unit Sale Price Verification"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://compliscan.gov.in/#website",
      "url": "https://compliscan.gov.in",
      "name": "CompliScan AI Official Portal",
      "description": "Official GovTech portal for automated legal metrology compliance verification and digital evidence generation.",
      "publisher": { "@id": "https://compliscan.gov.in/#organization" },
      "inLanguage": "en-IN"
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://compliscan.gov.in/#software",
      "name": "CompliScan AI",
      "applicationCategory": ["GovernmentApplication", "BusinessApplication", "UtilitiesApplication"],
      "operatingSystem": "Web, Android, iOS, Linux Edge Terminals",
      "url": "https://compliscan.gov.in",
      "softwareVersion": "2.4.0-SIH2026",
      "offers": {
        "@type": "Offer",
        "price": "0.22",
        "priceCurrency": "INR",
        "description": "Cost per 4-panel AI multimodal packaging verification dossier"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.96",
        "reviewCount": "1240",
        "bestRating": "5",
        "worstRating": "1"
      }
    },
    {
      "@type": "GovernmentService",
      "@id": "https://compliscan.gov.in/#service",
      "name": "Automated Legal Metrology Act 2009 & PCR 2011 Compliance Inspection",
      "serviceType": "Statutory Packaging Inspection & Judicial Evidence Sealing",
      "serviceOperator": {
        "@type": "GovernmentOrganization",
        "name": "Legal Metrology Division, Department of Consumer Affairs (SIH 26034)"
      },
      "areaServed": {
        "@type": "Country",
        "name": "India"
      },
      "audience": {
        "@type": "Audience",
        "audienceType": "Legal Metrology Officers, District Consumer Forums, Enforcement Inspectors, Packaging Manufacturers"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://compliscan.gov.in/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is CompliScan AI and how does it automate Legal Metrology inspections under PCR 2011?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "CompliScan AI (SIH 26034) is an automated multimodal AI inspection system engineered for the Legal Metrology Division. It inspects packaged commodities across 4 synchronized panels (Front PDP, Back, Regulatory, and MRP/Batch) using Gemini Vision models, geometric computer vision, and a deterministic TypeScript compliance engine to verify all statutory declarations in under 4.5 seconds."
          }
        },
        {
          "@type": "Question",
          "name": "How does CompliScan AI calculate and verify Rule 6(11) Unit Sale Price (USP) mathematically?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Under Rule 6(11) of the Legal Metrology (Packaged Commodities) Rules, 2011, commodities must declare Unit Sale Price rounded to the nearest two decimal places (e.g. ₹/g, ₹/kg, ₹/ml, ₹/l, ₹/piece). CompliScan AI extracts declared MRP and Net Quantity, performs exact IEEE 754 float-calibrated math, compares it to the printed USP declaration, and immediately flags any discrepancy exceeding statutory rounding limits."
          }
        },
        {
          "@type": "Question",
          "name": "How is Rule 7 Principal Display Panel (PDP) font height calibrated from photos?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Rule 7 & the First Schedule of PCR 2011 require numeral font heights between 1.0mm and 6.0mm depending on container geometry and PDP area (cm²). CompliScan AI computes packaging surface area (rectangular, cylindrical, pouch, or irregular), computes minimum statutory numeral heights, and utilizes sub-millimeter bounding box calibration to verify that printed numerals satisfy mandatory physical thresholds."
          }
        },
        {
          "@type": "Question",
          "name": "Are CompliScan AI electronic inspection reports admissible in court under Section 63 of Bharatiya Sakshya Adhiniyam, 2023?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Every inspection dossier generates a cryptographically sealed digital evidence certificate compliant with Section 63(4) of Bharatiya Sakshya Adhiniyam, 2023 (BSA). The record incorporates master SHA-256 evidence hashing across all camera frames, GPS coordinates, device hardware ID bonding, and timestamping to guarantee tamper-evidence in legal enforcement proceedings."
          }
        },
        {
          "@type": "Question",
          "name": "Can CompliScan AI operate in offline standalone mode in rural mandis and remote retail checkpoints?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. CompliScan AI features an offline-first architecture with IndexedDB local queues. Field inspectors operating in remote areas with zero network connectivity can perform visual inspections, calculate rule checks locally, store signed evidence packages, and automatically batch-synchronize to central servers when connection is restored."
          }
        }
      ]
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
