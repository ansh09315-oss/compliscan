import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function saveDossierToSupabase(dossier: any, violations: any[] = [], capturedAngles: any[] = []) {
  if (!supabase) {
    console.info('[Supabase] Offline/Local mode active. Set NEXT_PUBLIC_SUPABASE_URL in .env to enable cloud sync.');
    return { success: false, reason: 'NOT_CONFIGURED' };
  }

  try {
    // 1. Insert or Upsert Inspection Dossier
    const { data: insertedDossier, error: dossierErr } = await supabase
      .from('inspection_dossiers')
      .upsert({
        dossier_reference_code: dossier.dossierReferenceCode,
        product_name: dossier.productName,
        brand_name: dossier.brandName,
        category: dossier.category,
        packaging_geometry: dossier.packagingGeometry,
        container_height_mm: dossier.containerHeightMm,
        container_width_mm: dossier.containerWidthMm || null,
        circumference_mm: dossier.circumferenceMm || null,
        pdp_area_cm2: dossier.pdpAreaCm2 || 0,
        declared_net_quantity: dossier.declaredNetQuantity,
        declared_net_unit: dossier.declaredNetUnit,
        declared_mrp: dossier.declaredMrp,
        declared_usp_value: dossier.declaredUspValue || null,
        declared_usp_unit: dossier.declaredUspUnit || null,
        declared_mfg_month: dossier.declaredMfgMonth || null,
        declared_mfg_year: dossier.declaredMfgYear || null,
        manufacturer_name: dossier.manufacturerName || null,
        manufacturer_address: dossier.manufacturerAddress || null,
        country_of_origin: dossier.countryOfOrigin || 'India',
        consumer_care_phone: dossier.consumerCarePhone || null,
        consumer_care_email: dossier.consumerCareEmail || null,
        detected_font_height_mm: dossier.detectedFontHeightMm || 2.5,
        compliance_score: dossier.complianceScore || 0,
        verdict: dossier.verdict,
        master_sha256_hash: dossier.masterSha256Hash,
        is_tamper_evident: true,
        is_synced_to_central: true,
        synced_at: new Date().toISOString(),
        inspector_remarks: dossier.inspectorRemarks || null,
      }, { onConflict: 'dossier_reference_code' })
      .select()
      .single();

    if (dossierErr) {
      console.error('[Supabase] Failed to upsert dossier:', dossierErr);
      return { success: false, error: dossierErr.message };
    }

    const dossierId = insertedDossier.id;

    // 2. Insert Violations
    if (violations && violations.length > 0) {
      const vRecords = violations.map((v: any) => ({
        dossier_id: dossierId,
        statutory_rule_ref: v.statutoryRuleRef || v.ruleCode || 'RULE_DEFECT',
        severity: v.severity || 'MEDIUM',
        violation_title: v.violationTitle || v.title || 'Statutory Non-Compliance',
        defect_description: v.defectDescription || v.defect || '',
        detected_value: String(v.detectedValue || v.detected || ''),
        required_value: String(v.requiredValue || v.expected || ''),
      }));

      const { error: vErr } = await supabase.from('violation_records').insert(vRecords);
      if (vErr) console.warn('[Supabase] Non-fatal violation insert warning:', vErr);
    }

    // 3. Insert Angles
    if (capturedAngles && capturedAngles.length > 0) {
      const aRecords = capturedAngles.map((a: any) => ({
        dossier_id: dossierId,
        angle_type: a.angleType,
        sha256_hash: a.sha256Hash || 'HASH',
        optical_width: a.opticalWidth || 800,
        optical_height: a.opticalHeight || 600,
      }));

      const { error: aErr } = await supabase.from('captured_angles').insert(aRecords);
      if (aErr) console.warn('[Supabase] Non-fatal angles insert warning:', aErr);
    }

    console.info(`[Supabase] Successfully synced dossier ${dossier.dossierReferenceCode} to Supabase Cloud.`);
    return { success: true, data: insertedDossier };
  } catch (err: any) {
    console.error('[Supabase] Sync error:', err);
    return { success: false, error: err.message };
  }
}

export async function logTestRunToSupabase(testName: string, testType: string, status: 'PASSED' | 'FAILED', details: any = {}) {
  if (!supabase) return { success: false, reason: 'OFFLINE' };
  try {
    const { error } = await supabase.from('test_runs').insert({
      test_name: testName,
      test_type: testType,
      status: status,
      details: details,
    });
    return { success: !error, error: error?.message };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function fetchDossiersFromSupabase(limit = 20) {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('inspection_dossiers')
      .select('*, violation_records(*)')
      .order('inspection_timestamp', { ascending: false })
      .limit(limit);
    if (error) {
      console.warn('[Supabase] Error fetching dossiers:', error);
      return [];
    }
    return data || [];
  } catch (e) {
    console.warn('[Supabase] Fetch error:', e);
    return [];
  }
}

