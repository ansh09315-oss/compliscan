# CompliScan AI

## Project Overview
CompliScan AI is an automated Legal Metrology (Packaged Commodities) compliance inspection platform. It provides real-time statutory verification for packaged goods in India under the Legal Metrology Act 2009 and Packaged Commodities Rules 2011, with tamper-evident Section 63 BSA electronic evidence generation and offline sync capabilities.

## Tech Stack
- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Lucide Icons, Glassmorphism design
- **State**: Zustand (`useAppStore`), IndexedDB / LocalStorage for offline queue
- **Database & ORM**: Prisma ORM, SQLite
- **Verification & Review**: CodeRabbit, Roo Code, Dev Containers, RALPH Loop, GSD

## Core Requirements & Statutory Coverage
- **Rule 6**: Mandatory declarations check (Name & Address of Manufacturer/Packer/Importer, Generic Commodity Name, Net Quantity, MRP inclusive of taxes, Month and Year of Manufacture/Packing, Country of Origin, Consumer Care details).
- **Rule 7**: Standard Units of Weights & Measures (g, kg, mL, L, m, mm, cm, No.).
- **Rule 8**: Minimum Font Height compliance based on Principal Display Panel (PDP) surface area.
- **Rule 11**: Multi-piece and wholesale package labeling.
- **Section 63 BSA**: Cryptographic SHA-256 electronic record admissibility certificate.
