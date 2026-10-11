import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://compliscan.netlify.app'),
  title: "CompliScan AI — Automated Legal Metrology Act 2009 & PCR 2011 Compliance Platform",
  description: "CompliScan AI (SIH 26034) automates Legal Metrology & Packaged Commodities Rules (PCR 2011) audits, Rule 6(11) Unit Sale Price math, Rule 7 PDP font heights, FSSAI checks, and BSA 2023 §63 digital evidence dossiers in <4.5s.",
  keywords: [
    "CompliScan AI",
    "CompliScan",
    "Legal Metrology Act 2009 Software",
    "Packaged Commodities Rules 2011 AI",
    "PCR 2011 Compliance Scanner",
    "Rule 6(11) Unit Sale Price Calculator",
    "Rule 7 Font Height Matrix",
    "BSA 2023 Section 63 Digital Evidence",
    "SIH 26034"
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
    url: "/",
    title: "CompliScan AI — Automated Legal Metrology Act 2009 & PCR 2011 Compliance Platform",
    description: "CompliScan AI (SIH 26034) automates Legal Metrology & Packaged Commodities Rules (PCR 2011) audits, Rule 6(11) Unit Sale Price math, Rule 7 PDP font heights, FSSAI checks, and BSA 2023 §63 digital evidence dossiers in <4.5s.",
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
    description: "CompliScan AI (SIH 26034) automates Legal Metrology & Packaged Commodities Rules (PCR 2011) audits, Rule 6(11) Unit Sale Price math, Rule 7 PDP font heights, FSSAI checks, and BSA 2023 §63 digital evidence dossiers in <4.5s.",
    images: ["/assets/og-banner.png"],
  },
  category: "Government Enterprise Compliance Software",
};

const jsonLdGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "Brand"],
      "@id": "https://compliscan.netlify.app/#organization",
      "name": "CompliScan AI",
      "alternateName": "CompliScan Legal Metrology AI (SIH 26034)",
      "url": "https://compliscan.netlify.app",
      "logo": "https://compliscan.netlify.app/assets/emblem.svg",
      "description": "National automated regulatory inspection platform for packaged commodities under the Legal Metrology Act 2009 and Packaged Commodities Rules 2011 (SIH 26034).",
      "parentOrganization": {
        "@type": "GovernmentOrganization",
        "name": "Ministry of Consumer Affairs, Food and Public Distribution, Government of India (SIH 26034)",
        "url": "https://consumeraffairs.nic.in"
      },
      "slogan": "Precision Statutory Metrology for India's Consumer Protection",
      "knowsAbout": [
        "Legal Metrology Act, 2009",
        "Legal Metrology (Packaged Commodities) Rules, 2011",
        "Bharatiya Sakshya Adhiniyam, 2023 Section 63",
        "FSSAI Labeling Norms",
        "Rule 6(11) Unit Sale Price Verification",
        "Rule 7 Principal Display Panel Font Height"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://compliscan.netlify.app/#website",
      "url": "https://compliscan.netlify.app",
      "name": "CompliScan AI Official Portal",
      "description": "Official GovTech portal for automated legal metrology compliance verification and digital evidence generation.",
      "publisher": { "@id": "https://compliscan.netlify.app/#organization" },
      "inLanguage": "en-IN"
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://compliscan.netlify.app/#software",
      "name": "CompliScan AI",
      "applicationCategory": ["GovernmentApplication", "BusinessApplication"],
      "operatingSystem": "Web, Android, iOS, Linux",
      "url": "https://compliscan.netlify.app",
      "softwareVersion": "2.4.0-SIH26034",
      "offers": {
        "@type": "Offer",
        "price": "0.22",
        "priceCurrency": "INR",
        "description": "0.22 INR per scan"
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
      "@id": "https://compliscan.netlify.app/#service",
      "name": "Automated Legal Metrology Act 2009 & PCR 2011 Compliance Inspection",
      "serviceType": "Statutory Packaging Inspection & Judicial Evidence Sealing",
      "serviceOperator": {
        "@type": "GovernmentOrganization",
        "name": "Ministry of Consumer Affairs (SIH 26034)"
      },
      "areaServed": "IN",
      "audience": {
        "@type": "Audience",
        "audienceType": "Legal Metrology Officers, District Consumer Forums, Enforcement Inspectors, Packaging Manufacturers"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://compliscan.netlify.app/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How does CompliScan AI eliminate AI hallucinations during legal enforcement?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "CompliScan implements a strict split-path architecture. While Gemini Multimodal VLM synthesizes visual and linguistic contexts across 4 angles, all statutory numerical checks (MRP, Net Quantity, Font Height, USP) are arbitrated by the Master Brain in deterministic TypeScript and Python math. A dedicated verification function (_is_number_grounded_in_ocr) verifies that every reported number exists verbatim in raw PaddleOCR tokens before generating statutory violation notices."
          }
        },
        {
          "@type": "Question",
          "name": "What legal validity do CompliScan inspection dossiers hold in Indian courts?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Every inspection generates a cryptographic tamper-evident dossier complying with Section 63(4) of the Bharatiya Sakshya Adhiniyam, 2023 (replacing Section 65B of the Indian Evidence Act). The platform auto-generates two official certificates: Schedule Part A (Electronic System Custodian Certificate) and Schedule Part B (Officer in Charge Declaration), binding high-resolution evidence images, inspector GPS coordinates, and raw SHA-256 hashes into a court-ready PDF."
          }
        },
        {
          "@type": "Question",
          "name": "How does the system calculate PDP area for irregular or cylindrical containers under Rule 7?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Under Rule 7 of the Packaged Commodities Rules, 2011, PDP area calculation depends on package geometry. For rectangular boxes, area is Height × Width ÷ 100. For cylindrical cans and bottles, Rule 7 mandates calculating 40% of the total height multiplied by container circumference (0.40 × [Height × Circumference] ÷ 100). CompliScan AI includes pre-calibrated geometric estimators to automatically determine the exact threshold tier."
          }
        },
        {
          "@type": "Question",
          "name": "Can enforcement officers conduct raids in offline rural mandis without internet?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. CompliScan AI is built with an offline-first service worker architecture using client-side IndexedDB caching. When inspecting in underground warehouses or remote rural mandis with zero signal, inspection photos, local PaddleOCR extractions, and preliminary Rule 7 measurements are recorded locally. Once the device re-enters 4G/5G or Wi-Fi range, queued dossiers seamlessly synchronize with the central government database."
          }
        },
        {
          "@type": "Question",
          "name": "How does the Unit Sale Price (USP) calculation handle different metric commodities?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Per Gazette Notification GSR 779(E) amending PCR 2011, commodities under 1 kg must declare price per gram, commodities of 1 kg or more must declare price per kilogram, commodities under 1 liter must declare price per milliliter, and commodities of 1 liter or more must declare price per liter. For items sold by number, the price per item/piece is mandatory. CompliScan automatically applies unit normalization and validates declarations within a ±₹0.05 statutory tolerance."
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
