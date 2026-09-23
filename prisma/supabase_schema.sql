-- ============================================================================
-- CompliScan AI - Supabase PostgreSQL Schema for SIH 26034
-- Legal Metrology Packaged Commodities Inspection Database
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Inspectors Table
CREATE TABLE IF NOT EXISTS public.inspectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    badge_number VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    assigned_district VARCHAR(255) NOT NULL,
    state_territory VARCHAR(255) DEFAULT 'Delhi NCT',
    public_key TEXT DEFAULT 'RSA-2048-GOV-SIMULATED-KEY',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Statutory Rules Table
CREATE TABLE IF NOT EXISTS public.statutory_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_code VARCHAR(50) UNIQUE NOT NULL,
    statutory_reference TEXT NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL, -- CRITICAL, HIGH, MEDIUM, LOW
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Inspection Dossiers Table (Main Inspection & Test Store)
CREATE TABLE IF NOT EXISTS public.inspection_dossiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dossier_reference_code VARCHAR(100) UNIQUE NOT NULL,
    inspector_id UUID REFERENCES public.inspectors(id) ON DELETE SET NULL,
    inspection_timestamp TIMESTAMPTZ DEFAULT NOW(),

    -- Product Identification
    product_name TEXT NOT NULL,
    brand_name TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    packaging_geometry VARCHAR(100) NOT NULL,

    -- Spatial Dimensions & PDP Area
    container_height_mm NUMERIC(8, 2) NOT NULL,
    container_width_mm NUMERIC(8, 2),
    circumference_mm NUMERIC(8, 2),
    pdp_area_cm2 NUMERIC(10, 2) NOT NULL,

    -- Extracted Statutory Declarations
    declared_net_quantity NUMERIC(10, 2) NOT NULL,
    declared_net_unit VARCHAR(20) NOT NULL,
    declared_mrp NUMERIC(10, 2) NOT NULL,
    declared_usp_value NUMERIC(10, 4),
    declared_usp_unit VARCHAR(50),
    declared_mfg_month INT,
    declared_mfg_year INT,
    declared_exp_date TEXT,
    manufacturer_name TEXT,
    manufacturer_address TEXT,
    country_of_origin VARCHAR(100) DEFAULT 'India',
    consumer_care_phone VARCHAR(50),
    consumer_care_email VARCHAR(255),

    -- Verification & Legal Metrology Results
    detected_font_height_mm NUMERIC(6, 2) NOT NULL,
    compliance_score NUMERIC(5, 2) NOT NULL,
    verdict VARCHAR(50) NOT NULL, -- COMPLIANT, PARTIALLY_COMPLIANT, NON_COMPLIANT, REVIEW_REQUIRED

    -- Section 63 BSA 2023 Evidentiary Metadata
    master_sha256_hash VARCHAR(64) NOT NULL,
    device_hardware_id VARCHAR(100) DEFAULT 'COMPLISCAN-MOBILE-HUD',
    geo_latitude NUMERIC(10, 7),
    geo_longitude NUMERIC(10, 7),
    is_tamper_evident BOOLEAN DEFAULT TRUE,
    
    -- Sync Metadata
    is_synced_to_central BOOLEAN DEFAULT TRUE,
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Custom Inspector Remarks
    inspector_remarks TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Captured Angles / Artifacts Table (Front, Back, Regulatory, MRP)
CREATE TABLE IF NOT EXISTS public.captured_angles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dossier_id UUID REFERENCES public.inspection_dossiers(id) ON DELETE CASCADE,
    angle_type VARCHAR(50) NOT NULL, -- FRONT, BACK, REGULATORY_SIDE, MRP_BATCH
    image_url TEXT,
    sha256_hash VARCHAR(64) NOT NULL,
    optical_width INT,
    optical_height INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Violation Records Table
CREATE TABLE IF NOT EXISTS public.violation_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dossier_id UUID REFERENCES public.inspection_dossiers(id) ON DELETE CASCADE,
    statutory_rule_ref TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL,
    violation_title TEXT NOT NULL,
    defect_description TEXT NOT NULL,
    detected_value TEXT,
    required_value TEXT,
    is_contested BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Test Runs & Telemetry Logs
CREATE TABLE IF NOT EXISTS public.test_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_name VARCHAR(100) NOT NULL,
    test_type VARCHAR(50) NOT NULL, -- UNIT, E2E, VLM, OCR, TRI_CORE
    status VARCHAR(20) NOT NULL,     -- PASSED, FAILED
    details JSONB,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_dossiers_code ON public.inspection_dossiers(dossier_reference_code);
CREATE INDEX IF NOT EXISTS idx_dossiers_timestamp ON public.inspection_dossiers(inspection_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_violations_dossier ON public.violation_records(dossier_id);
CREATE INDEX IF NOT EXISTS idx_angles_dossier ON public.captured_angles(dossier_id);

-- Row Level Security (RLS)
ALTER TABLE public.inspectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.captured_angles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.violation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_runs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated and anon access for hackathon / inspection operations
CREATE POLICY "Allow public read access to dossiers" ON public.inspection_dossiers FOR SELECT USING (true);
CREATE POLICY "Allow public insert to dossiers" ON public.inspection_dossiers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to dossiers" ON public.inspection_dossiers FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to violations" ON public.violation_records FOR SELECT USING (true);
CREATE POLICY "Allow public insert to violations" ON public.violation_records FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to angles" ON public.captured_angles FOR SELECT USING (true);
CREATE POLICY "Allow public insert to angles" ON public.captured_angles FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to tests" ON public.test_runs FOR SELECT USING (true);
CREATE POLICY "Allow public insert to tests" ON public.test_runs FOR INSERT WITH CHECK (true);
