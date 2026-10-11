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
    password_hash VARCHAR(255),
    salt VARCHAR(64),
    role VARCHAR(50) DEFAULT 'INSPECTOR', -- ADMIN, INSPECTOR, SUPERVISOR
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

-- Row Level Security (RLS) — Hardened Policies (Zero-Trust & BOLA / IDOR Defense)
ALTER TABLE public.inspectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statutory_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.captured_angles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.violation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_runs ENABLE ROW LEVEL SECURITY;

-- 1. Inspectors:
-- Field inspectors can only view their own identity record; Admins & Supervisors view all inspectors.
CREATE POLICY "Inspectors viewable by self or administrative roles" ON public.inspectors 
    FOR SELECT TO authenticated 
    USING (
        (select auth.uid()) = id
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('ADMIN', 'SUPERVISOR')
    );

CREATE POLICY "Inspectors updatable by self or admin" ON public.inspectors 
    FOR UPDATE TO authenticated 
    USING (
        (select auth.uid()) = id
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN'
    )
    WITH CHECK (
        (select auth.uid()) = id
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN'
    );

CREATE POLICY "Inspectors insertable only by admin" ON public.inspectors 
    FOR INSERT TO authenticated 
    WITH CHECK (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN'
    );

-- 2. Statutory Rules:
-- All authenticated officers can read regulatory rules; modifications restricted to Admins.
CREATE POLICY "Statutory rules viewable by authenticated users" ON public.statutory_rules 
    FOR SELECT TO authenticated 
    USING (true);

CREATE POLICY "Statutory rules modifiable only by admins" ON public.statutory_rules 
    FOR ALL TO authenticated 
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN'
    )
    WITH CHECK (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN'
    );

-- 3. Inspection Dossiers:
-- Anti-BOLA / IDOR: Field inspectors can only access dossiers they recorded. Supervisors & Admins see all.
CREATE POLICY "Dossiers viewable by owner or supervisors" ON public.inspection_dossiers 
    FOR SELECT TO authenticated 
    USING (
        (select auth.uid()) = inspector_id
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('ADMIN', 'SUPERVISOR')
    );

-- Enforce that dossiers are always authored by the caller's authentic identity from auth.uid()
CREATE POLICY "Dossiers insertable by assigned inspector" ON public.inspection_dossiers 
    FOR INSERT TO authenticated 
    WITH CHECK (
        (select auth.uid()) = inspector_id
        AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('INSPECTOR', 'SUPERVISOR', 'ADMIN')
    );

-- Update requires both USING and WITH CHECK to prevent reassigning ownership to another inspector
CREATE POLICY "Dossiers updatable by author or admin" ON public.inspection_dossiers 
    FOR UPDATE TO authenticated 
    USING (
        (select auth.uid()) = inspector_id
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN'
    )
    WITH CHECK (
        (select auth.uid()) = inspector_id
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN'
    );

CREATE POLICY "Dossiers deletable only by admin" ON public.inspection_dossiers 
    FOR DELETE TO authenticated 
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN'
    );

-- 4. Captured Angles / Artifacts:
-- Accessible only if caller has access to the parent inspection dossier
CREATE POLICY "Captured angles viewable by dossier owners or supervisors" ON public.captured_angles 
    FOR SELECT TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.inspection_dossiers d
            WHERE d.id = captured_angles.dossier_id
            AND (
                d.inspector_id = (select auth.uid())
                OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('ADMIN', 'SUPERVISOR')
            )
        )
    );

CREATE POLICY "Captured angles insertable for owned dossiers" ON public.captured_angles 
    FOR INSERT TO authenticated 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.inspection_dossiers d
            WHERE d.id = captured_angles.dossier_id
            AND (
                d.inspector_id = (select auth.uid())
                OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('ADMIN', 'SUPERVISOR')
            )
        )
    );

CREATE POLICY "Captured angles updatable for owned dossiers or admin" ON public.captured_angles 
    FOR UPDATE TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.inspection_dossiers d
            WHERE d.id = captured_angles.dossier_id
            AND (
                d.inspector_id = (select auth.uid())
                OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN'
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.inspection_dossiers d
            WHERE d.id = captured_angles.dossier_id
            AND (
                d.inspector_id = (select auth.uid())
                OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN'
            )
        )
    );

-- 5. Violation Records:
-- Accessible and insertable only if caller has access to the parent inspection dossier
CREATE POLICY "Violations viewable by dossier owners or supervisors" ON public.violation_records 
    FOR SELECT TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.inspection_dossiers d
            WHERE d.id = violation_records.dossier_id
            AND (
                d.inspector_id = (select auth.uid())
                OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('ADMIN', 'SUPERVISOR')
            )
        )
    );

CREATE POLICY "Violations insertable for owned dossiers" ON public.violation_records 
    FOR INSERT TO authenticated 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.inspection_dossiers d
            WHERE d.id = violation_records.dossier_id
            AND (
                d.inspector_id = (select auth.uid())
                OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('ADMIN', 'SUPERVISOR')
            )
        )
    );

CREATE POLICY "Violations updatable for owned dossiers or admin" ON public.violation_records 
    FOR UPDATE TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.inspection_dossiers d
            WHERE d.id = violation_records.dossier_id
            AND (
                d.inspector_id = (select auth.uid())
                OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN'
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.inspection_dossiers d
            WHERE d.id = violation_records.dossier_id
            AND (
                d.inspector_id = (select auth.uid())
                OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN'
            )
        )
    );

-- 6. Test Telemetry Runs:
-- Only supervisors and admins can view and record internal test telemetry
CREATE POLICY "Tests viewable by supervisors and admins" ON public.test_runs 
    FOR SELECT TO authenticated 
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('ADMIN', 'SUPERVISOR')
    );

CREATE POLICY "Tests insertable by supervisors and admins" ON public.test_runs 
    FOR INSERT TO authenticated 
    WITH CHECK (
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('ADMIN', 'SUPERVISOR')
    );
