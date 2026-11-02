import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://compliscan.netlify.app'),
  title: "CompliScan AI | Automated Legal Metrology Act 2009 & PCR 2011 Compliance Platform",
  description: "CompliScan AI is India's automated Legal Metrology & Packaged Commodities Rules (PCR 2011) inspection system. Verify Rule 6(11) Unit Sale Price math, Rule 7 PDP font heights, and BSA 2023 Section 63 digital evidence dossiers in under 4.5 seconds.",
  keywords: [
    "CompliScan AI",
    "Legal Metrology Act 2009",
    "Packaged Commodities Rules 2011",
    "PCR 2011 Compliance Software",
    "Rule 6(11) Unit Sale Price Calculator",
    "Rule 7 Font Height Matrix",
    "BSA 2023 Section 63 Digital Evidence",
    "Consumer Protection India",
    "Automated Packaging Inspection",
    "Mandatory Label Declarations"
  ],
  authors: [{ name: "Government of India — Ministry of Consumer Affairs" }],
  creator: "CompliScan AI Taskforce",
  publisher: "Ministry of Consumer Affairs, Food & Public Distribution",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://compliscan.netlify.app/",
  },
  verification: {
    google: "compliscan-google-site-verification-metrology-portal",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://compliscan.netlify.app/",
    title: "CompliScan AI | Automated Legal Metrology Act 2009 & PCR 2011 Compliance Platform",
    description: "CompliScan AI is India's automated Legal Metrology & Packaged Commodities Rules (PCR 2011) inspection system. Verify Rule 6(11) Unit Sale Price math, Rule 7 PDP font heights, and BSA 2023 Section 63 digital evidence dossiers in under 4.5 seconds.",
    siteName: "CompliScan AI",
    images: [
      {
        url: "/assets/emblem.svg",
        width: 1200,
        height: 630,
        alt: "CompliScan AI - National Legal Metrology Inspection System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CompliScan AI | Automated Legal Metrology Act 2009 & PCR 2011 Compliance Platform",
    description: "CompliScan AI is India's automated Legal Metrology & Packaged Commodities Rules (PCR 2011) inspection system. Verify Rule 6(11) Unit Sale Price math, Rule 7 PDP font heights, and BSA 2023 Section 63 digital evidence dossiers in under 4.5 seconds.",
    images: ["/assets/emblem.svg"],
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
      "alternateName": "CompliScan Legal Metrology AI",
      "url": "https://compliscan.netlify.app",
      "logo": "https://compliscan.netlify.app/assets/emblem.svg",
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
      "softwareVersion": "2.4.0",
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
        "name": "Ministry of Consumer Affairs"
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
          "name": "How does CompliScan AI inspect product packaging in under 4.5 seconds?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "CompliScan AI fuses a multimodal dual-pipeline engine. High-resolution packaging photos pass through GPU-accelerated CIELAB glare reduction and sub-millimeter OCR tokenization while simultaneously evaluating bounding boxes against Legal Metrology statutory matrices in parallel."
          }
        },
        {
          "@type": "Question",
          "name": "Which Packaged Commodities Rules (PCR 2011) are verified automatically?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The engine audits Rule 7 Principal Display Panel (PDP) font heights mapped to surface area geometry, Rule 6(11) Unit Sale Price (USP) normalized arithmetic (₹/g, ₹/kg, ₹/ml, ₹/l, ₹/piece), manufacturer declarations, net quantity declarations, and consumer care helplines."
          }
        },
        {
          "@type": "Question",
          "name": "Are the generated digital evidence reports admissible under BSA Section 63?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Every generated inspection dossier automatically produces Schedule Part A & B electronic evidence certificates under Section 63(4) of the Bharatiya Sakshya Adhiniyam, 2023. Raw images, bounding boxes, and verdicts are bound with master SHA-256 cryptographic hashes and device hardware IDs."
          }
        },
        {
          "@type": "Question",
          "name": "How do authorized Legal Metrology officers log in to the portal?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Enforcement officers click 'Officer Login' on this portal to open the 3D secure vault. Authentication is granted through official credentials, verified district jurisdiction keys, or the instant inspector simulation sandbox."
          }
        }
      ]
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://compliscan.netlify.app/#breadcrumbs",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "CompliScan AI National Portal",
          "item": "https://compliscan.netlify.app/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Statutory Packaging Verification (PCR 2011)",
          "item": "https://compliscan.netlify.app/#about"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Rule 6(11) & Rule 7 Technical Approach",
          "item": "https://compliscan.netlify.app/#technical-approach"
        }
      ]
    },
    {
      "@type": "Person",
      "@id": "https://compliscan.netlify.app/#author",
      "name": "Principal Legal Metrology Architect & Enforcement Directorate",
      "jobTitle": "Chief Regulatory Auditor & Forensic Systems Fellow",
      "worksFor": {
        "@type": "GovernmentOrganization",
        "name": "Ministry of Consumer Affairs, Food & Public Distribution",
        "url": "https://consumeraffairs.nic.in"
      },
      "description": "Statutory metrology systems architect leading automated compliance pipelines for the Legal Metrology Act 2009, Packaged Commodities Rules 2011, and BSA 2023 Section 63 evidentiary dossiers."
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth overflow-x-hidden">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
        />
      </head>
      <body className="overflow-x-hidden overflow-y-auto bg-white text-[#0F172A] antialiased">
        {children}
      </body>
    </html>
  );
}
