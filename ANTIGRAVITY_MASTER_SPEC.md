METROLOGY AI: UNIVERSAL LEGAL METROLOGY COMPLIANCE INSPECTION SYSTEMFULL-STACK ARCHITECTURAL SPECIFICATION & AUTONOMOUS IMPLEMENTATION BLUEPRINTTarget Workspace Path: C:\Users\ansh0\OneDrive\Desktop\compliscanProblem Statement: SIS 2026 Problem ID 26034 (Legal Metrology Act, 2009 & Packaged Commodities Rules, 2011/2026)Authority: Ministry of Consumer Affairs, Food & Public Distribution, Government of IndiaAgent Operating Mode: Autonomous Multi-Surface Execution (Editor + Terminal + Integrated Browser)1. SYSTEM ARCHITECTURE & TECHNOLOGY STACKYou must build a complete full-stack web application with offline-first capabilities:Frontend Framework: Next.js 14+ (App Router), React 19, TypeScript (Strict Mode).Styling & UI Tokens: Tailwind CSS, Lucide React icons, shadcn/ui primitives.State Management: Zustand with persistent localStorage / IndexedDB hydration for offline durability.Charts & Visualization: Recharts for telemetry, trends, and compliance distributions.Backend API Layer: Next.js Server Actions & API Route Handlers (src/app/api/v1/).Database & ORM: SQLite via Prisma ORM (Zero-configuration local setup for Windows, fully portable, easily swappable with PostgreSQL via connection string).Computer Vision & OCR Pipeline: Hybrid edge pipeline with client-side image hashing (Web Crypto API SHA-256), OpenCV.js canvas preprocessing, and modular server-side OCR simulation & deterministic regex tokenizers.Legal Document Generation: @react-pdf/renderer and HTML5 Canvas print stylesheets formatted for judicial admissibility under Section 63 of Bharatiya Sakshya Adhiniyam, 2023.2. EXACT REPOSITORY FILE STRUCTUREThe agent must create and maintain this exact file tree:C:\Users\ansh0\OneDrive\Desktop\compliscan├── prisma/│   ├── schema.prisma                     # SQLite/Postgres persistence schema│   └── seed.ts                           # Database seed for historical inspections & demo rules├── public/│   ├── assets/emblem.svg                 # Government Emblem & Ashoka seal assets│   └── mock-samples/                     # Packaged commodity test images (solid, liquid, count)├── src/│   ├── app/│   │   ├── api/│   │   │   ├── auth/route.ts             # Officer auth & SSO mock handler│   │   │   ├── compliance/evaluate/route.ts # Rule engine execution endpoint│   │   │   ├── dossiers/route.ts         # Inspection CRUD & Section 63 hashing│   │   │   ├── dossiers/[id]/pdf/route.ts# Dynamic PDF report export│   │   │   ├── sync/batch/route.ts       # Offline sync batch processor│   │   │   └── telemetry/dashboard/route.ts # Real-time dashboard KPI aggregates│   │   ├── globals.css                   # Govt Navy, Emerald, Red, Amber tokens│   │   ├── layout.tsx                    # Root layout with offline indicator banner│   │   └── page.tsx                      # Primary SPA screenflow coordinator│   ├── components/│   │   ├── screens/│   │   │   ├── Screen01Login.tsx         # Login, Inspector ID, SSO, Offline toggle│   │   │   ├── Screen02Dashboard.tsx     # KPI metrics, recent activity, donut chart│   │   │   ├── Screen03NewStart.tsx      # Capture mode selector (Camera/Upload/Manual)│   │   │   ├── Screen04CameraHUD.tsx     # Live viewfinder with alignment guides & quality HUD│   │   │   ├── Screen05MultiAngle.tsx    # Multi-image capture checklist & previews│   │   │   ├── Screen06AIProcessing.tsx  # 5-step animated inference progress stepper│   │   │   ├── Screen07ExtractedReview.tsx # 3-column verification table with inline editing│   │   │   ├── Screen08ComplianceGauge.tsx # Circular score gauge & pass/fail checklist│   │   │   ├── Screen09ViolationCards.tsx # Granular violation cards with cropped evidence│   │   │   ├── Screen10ReportDossier.tsx # Digital certificate, SHA-256 hash, PDF export│   │   │   ├── Screen11HistoryTable.tsx  # Paginated historical database with search/filters│   │   │   ├── Screen12Analytics.tsx     # Recharts trendlines, donut, violation bars│   │   │   ├── Screen13OfflineSync.tsx   # Pending ledger, manual sync trigger, status monitor│   │   │   ├── Screen14Regulations.tsx   # Statutory browser for Rule 6, 7, 8, 11│   │   │   └── Screen15SideDrawer.tsx    # Officer profile, quick routing, logout│   │   ├── ui/                           # Reusable buttons, badges, modals, inputs│   │   └── pdf/│   │       └── InspectionPdfDocument.tsx # Strict legal metrology printable document│   ├── lib/│   │   ├── complianceEngine.ts           # Universal mathematical rule validation logic│   │   ├── cryptoUtils.ts                # Client-side SHA-256 hash generators│   │   ├── db.ts                         # Prisma client singleton│   │   └── store.ts                      # Zustand centralized application state│   └── types/│       └── metrology.ts                  # Shared TypeScript interfaces & types├── .env.example├── .gitignore├── package.json├── tailwind.config.ts└── tsconfig.json
---

### 3. DATABASE SCHEMA SPECIFICATION (`prisma/schema.prisma`)

The database must maintain data models tracking inspectors, inspections, angle captures, detected violations, and audit ledgers:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum CommodityCategory {
  FOOD_BEVERAGES
  PERSONAL_CARE_COSMETICS
  HOUSEHOLD_CHEMICALS
  PHARMACEUTICALS
  ELECTRONICS_HARDWARE
  OTHER
}

enum PackagingGeometry {
  RECTANGULAR_BOX
  CYLINDRICAL_CONTAINER
  FLEXIBLE_POUCH
  IRREGULAR_SHAPE
}

enum VerdictStatus {
  COMPLIANT
  PARTIALLY_COMPLIANT
  NON_COMPLIANT
  REVIEW_REQUIRED
}

enum SeverityLevel {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}

model Inspector {
  id              String             @id @default(uuid())
  badgeNumber     String             @unique
  fullName        String
  email           String             @unique
  assignedDistrict String
  stateTerritory  String             @default("Delhi NCT")
  publicKey       String             @default("RSA-2048-GOV-SIMULATED-KEY")
  isActive        Boolean            @default(true)
  inspections     InspectionDossier[]
  createdAt       DateTime           @default(now())
}

model InspectionDossier {
  id                    String              @id @default(uuid())
  dossierReferenceCode  String              @unique // Format: LM-YYYY-XXXXXX
  inspectorId           String
  inspector             Inspector           @relation(fields: [inspectorId], references: [id])
  inspectionTimestamp   DateTime            @default(now())
  
  // Product Identification
  productName           String
  brandName             String
  category              CommodityCategory
  packagingGeometry     PackagingGeometry
  
  // Spatial Dimensions & PDP
  containerHeightMm     Float
  containerWidthMm      Float?
  circumferenceMm       Float?
  pdpAreaCm2            Float
  
  // Extracted Declarations
  declaredNetQuantity   Float
  declaredNetUnit       String              // g, kg, ml, l, piece, number
  declaredMrp           Float
  declaredUspValue      Float?
  declaredUspUnit       String?
  declaredMfgMonth      Int
  declaredMfgYear       Int
  manufacturerName      String?
  manufacturerAddress   String?
  countryOfOrigin       String?
  consumerCarePhone     String?
  consumerCareEmail     String?
  
  // Verification Results
  detectedFontHeightMm  Float
  complianceScore       Float               // 0.0 to 100.0
  verdict               VerdictStatus
  
  // Section 63 BSA 2023 Evidentiary Metadata
  masterSha256Hash      String
  deviceHardwareId      String
  geoLatitude           Float?
  geoLongitude          Float?
  isTamperEvident       Boolean             @default(true)
  
  // Offline Synchronization States
  isSyncedToCentral     Boolean             @default(true)
  syncedAt              DateTime?
  
  // Relations
  capturedAngles        InspectionArtifact[]
  violations            ViolationRecord[]
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
}

model InspectionArtifact {
  id            String             @id @default(uuid())
  dossierId     String
  dossier       InspectionDossier  @relation(fields: [dossierId], references: [id], onDelete: Cascade)
  angleType     String             // FRONT, BACK, REGULATORY_SIDE, MRP_BATCH, ADDITIONAL
  imageDataUrl  String             // Base64 or relative storage path
  sha256Hash    String
  opticalWidth  Int
  opticalHeight Int
  createdAt     DateTime           @default(now())
}

model ViolationRecord {
  id                 String             @id @default(uuid())
  dossierId          String
  dossier            InspectionDossier  @relation(fields: [dossierId], references: [id], onDelete: Cascade)
  statutoryRuleRef   String             // Rule 6(1)(a), Rule 6(11), Rule 7, Rule 8
  severity           SeverityLevel
  violationTitle     String
  defectDescription  String
  detectedValue      String?
  requiredValue      String
  croppedEvidenceUrl String?
  createdAt          DateTime           @default(now())
}
4. STATUTORY RULE ENGINE SPECIFICATION (src/lib/complianceEngine.ts)The rule engine must implement zero hardcoding and calculate statutory requirements mathematically:Rule 7: Principal Display Panel (PDP) Surface Area Calculation:Rectangular Containers: $A_{\text{PDP}} = \frac{H_{\text{mm}} \times W_{\text{mm}}}{100}$Cylindrical Containers: $A_{\text{PDP}} = 0.40 \times \left( \frac{H_{\text{mm}} \times C_{\text{mm}}}{100} \right)$Flexible Pouches: Primary presentation face area $A = \frac{H \times W}{100}$.Rule 7: Minimum Font Height Verification Matrix:$A_{\text{PDP}} \le 50\text{ cm}^2 \implies \text{Minimum Font Height} = 1.0\text{ mm}$$50 < A_{\text{PDP}} \le 100\text{ cm}^2 \implies \text{Minimum Font Height} = 1.5\text{ mm}$$100 < A_{\text{PDP}} \le 500\text{ cm}^2 \implies \text{Minimum Font Height} = 2.5\text{ mm}$$500 < A_{\text{PDP}} \le 2500\text{ cm}^2 \implies \text{Minimum Font Height} = 4.0\text{ mm}$$A_{\text{PDP}} > 2500\text{ cm}^2 \implies \text{Minimum Font Height} = 6.0\text{ mm}$Rule 6(11): Unit Sale Price (USP) Mathematical Enforcement:If Net Qty Unit is Grams (g):Quantity $< 1000\text{ g}$: Declared unit must be ₹ per g. Statutory USP $= \text{Round}\left(\frac{\text{MRP}}{\text{Qty}}, 2\right)$.Quantity $\ge 1000\text{ g}$: Declared unit must be ₹ per kg. Statutory USP $= \text{Round}\left(\frac{\text{MRP}}{\text{Qty} / 1000}, 2\right)$.If Net Qty Unit is Kilograms (kg):Declared unit must be ₹ per kg. Statutory USP $= \text{Round}\left(\frac{\text{MRP}}{\text{Qty}}, 2\right)$.If Net Qty Unit is Milliliters (ml):Volume $< 1000\text{ ml}$: Declared unit must be ₹ per ml. Statutory USP $= \text{Round}\left(\frac{\text{MRP}}{\text{Qty}}, 2\right)$.Volume $\ge 1000\text{ ml}$: Declared unit must be ₹ per l. Statutory USP $= \text{Round}\left(\frac{\text{MRP}}{\text{Qty} / 1000}, 2\right)$.If Net Qty Unit is Liters (l):Declared unit must be ₹ per l. Statutory USP $= \text{Round}\left(\frac{\text{MRP}}{\text{Qty}}, 2\right)$.If Net Qty Unit is Numbers / Pieces / Units (N / Piece):Declared unit must be ₹ per piece or ₹ per number. Statutory USP $= \text{Round}\left(\frac{\text{MRP}}{\text{Qty}}, 2\right)$.Tolerable Discrepancy: If $|\text{Declared USP} - \text{Statutory USP}| > 0.05$, generate a HIGH severity violation.Rule 6(1)(a): Manufacturer Completeness Check:Must contain legal entity name AND postal address containing city, state, and 6-digit Indian PIN code.Rule 6(2): Consumer Care Redressal Check:Phone validator: Regex ^(\+91|0)?[6-9]\d{9}$|^1800\d{6,8}$.Email validator: Standard RFC 5322 regex.Missing either triggers a HIGH severity defect.5. COMPLETE 15-SCREEN FRONTEND UI & LOGIC SPECIFICATIONThe UI must reproduce the Department of Consumer Affairs inspection roadmap using these exact styles:Navbar & Drawer Background: #0B2545 (Metrology Navy)Canvas Background: #F4F6F9 (Light Slate)Cards & Data Tables: #FFFFFF with #E2E8F0 borders, rounded-lg, subtle drop shadowPrimary Actions: #1D4ED8 (Blue)Compliant Pass: #16A34A (Green)Violation Fail: #DC2626 (Red)Partially Compliant / Pending: #F59E0B (Amber)Emblem Gold: #D4AF37Detailed Screen Functionality:Screen 1 (Login Screen): Officer ID (1045), Password, District selector, "Login", "Login with SSO" (simulates instant auth), and "Offline Mode" toggle.Screen 2 (Inspector Dashboard): Top bar with dynamic officer badge, 4 KPI cards (Inspections, Violations, Reviews, Compliance Rate calculated from DB), Recent Inspections table with interactive rows, Donut chart, and quick-nav action pills.Screen 3 (New Inspection - Start): 3 interactive cards for "Scan Product" (camera), "Upload Images" (file chooser), and "Enter Details Manually" (direct form).Screen 4 (Camera HUD Viewfinder): Camera feed via navigator.mediaDevices.getUserMedia with bounding box overlay reticle, live quality badges (Good Lighting, Stable, Focus Good), flash toggle, and shutter button that calculates frame SHA-256 hash.Screen 5 (Multi-Image Angle Capture): 4 required slots (Front, Back, Regulatory Side, MRP Macro) and 1 optional slot (Additional Info). Allows preview, retake, and activates "Proceed to Analysis" when complete.Screen 6 (AI Processing Screen): Real-time animated 5-step stepper (Image Enhancement $\rightarrow$ Label Detection $\rightarrow$ Text Extraction $\rightarrow$ Token Identification $\rightarrow$ Compliance Verification) with dynamic 0% to 100% progress.Screen 7 (Extracted Information Review): 3-column table showing statutory field name, OCR-extracted value inside an inline editable input, and an AI confidence meter. Officer can edit any field.Screen 8 (Compliance Result Overview): Large semi-circular animated gauge showing the overall score (e.g. 82%), verdict status badge, and an interactive checklist of all statutory rules.Screen 9 (Violation Details & Evidence Dossier): Cards for every detected violation with severity pill (Critical, High, Medium), statutory rule citation, expected vs detected values, and cropped packaging visual evidence.Screen 10 (Final Inspection Report): Formal legal dossier displaying Dossier ID (LM-2026-XXXXXX), timestamps, officer verification, Section 63 BSA 2023 Digital Certificate box with SHA-256 hash, and functional "Export PDF" button.Screen 11 (Scanned History Management): Search bar with live debounced filtering, date range picker, verdict filter, and paginated table with view and download actions.Screen 12 (Analytics & Reports Dashboard): Recharts graphs for inspections over time, compliance breakdown donut, and top statutory violation categories.Screen 13 (Offline Data Synchronization): Queue of local unsynced dossiers, connectivity status indicator, and functional "Sync Now" button that flushes local queue to backend database.Screen 14 (Legal Regulations Knowledge Base): Accordion viewer with full legal text and searchable summaries of Rules 6, 7, 8, 11, and Act Section 36 penalties.Screen 15 (Side Navigation Drawer): Officer profile header with badge number and district, navigation links to all screens, sync counter badge, and logout action.6. DIGITAL EVIDENCE & SECTION 63 BHARATIYA SAKSHYA ADHINIYAM (BSA) 2023To ensure digital admissibility in courts:Every captured photo must have an immediate cryptographic SHA-256 hash computed using the Web Crypto API:$$\text{SHA-256}(\text{Raw Byte Stream}) \to \text{Hex String}$$The final inspection dossier must compile Part A and Part B certificates under Section 63(4) of Bharatiya Sakshya Adhiniyam, 2023:Part A: Device hardware identifier, system timestamp, capture application version, and image SHA-256 digests.Part B: Electronic signature verification by the inspecting officer.The "Export PDF" feature must embed this certificate directly at the end of the legal report.7. MULTI-SURFACE AUTONOMOUS EXECUTION PLANExecute the following stages sequentially using the Terminal, Editor, and Browser surfaces:Phase 1: Environment Scaffolding & Dependencies (Terminal Surface)Initialize Next.js project with Tailwind CSS, TypeScript, and Lucide React.Install project dependencies:Bashnpm install zustand recharts clsx tailwind-merge @prisma/client @react-pdf/renderer
npm install -D prisma @types/node @types/react
Initialize Prisma with SQLite:Bashnpx prisma init --datasource-provider sqlite
Write prisma/schema.prisma as specified, run migrations, and execute database seed:Bashnpx prisma migrate dev --name init
Phase 2: Core Business Logic & Persistence Layer (Editor Surface)Implement src/lib/types/metrology.ts with complete domain interfaces.Implement src/lib/complianceEngine.ts with mathematical Rule 6, 7, and 11 validations.Implement src/lib/cryptoUtils.ts with SHA-256 generation functions.Implement src/lib/store.ts using Zustand to manage officer session, active capture slots, dynamic extracted fields, evaluation results, and offline queues.Implement backend API route handlers under src/app/api/v1/.Phase 3: Screen-by-Screen Frontend Development (Editor Surface)Build Screen 1 through Screen 15 under src/components/screens/.Connect all buttons, form inputs, and state transitions to src/lib/store.ts.Implement dynamic PDF dossier generation in src/components/pdf/InspectionPdfDocument.tsx.Phase 4: Verification & Automated Integration (Terminal & Browser Surfaces)Run strict TypeScript compiler verification:Bashnpx tsc --noEmit
Build the production bundle:Bashnpm run build
Launch development server:Bashnpm run dev
Open the Antigravity Integrated Browser at http://localhost:3000 and autonomously verify:Login with Inspector ID 1045.Navigate from Dashboard $\rightarrow$ New Inspection $\rightarrow$ Multi-Angle Capture $\rightarrow$ AI Processing $\rightarrow$ Review Table $\rightarrow$ Compliance Gauge $\rightarrow$ Violation Dossier $\rightarrow$ PDF Report.Test calculations with both a solid commodity (biscuits in grams) and a liquid commodity (oil in milliliters).Verify that all buttons navigate without console errors.