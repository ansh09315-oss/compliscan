import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CompliScan AI — Legal Metrology Compliance Inspection System",
  description: "Universal Legal Metrology Compliance Inspection System for packaged commodities under the Legal Metrology Act, 2009 & Packaged Commodities Rules, 2011/2026. Government of India — Ministry of Consumer Affairs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
