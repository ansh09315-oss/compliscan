"""
Supabase PostgreSQL & REST Data Layer (backend/supabase_db.py)
Stores multi-angle inspection dossiers, test runs, telemetry logs, and statutory violations in Supabase.
"""

import os
import logging
from typing import Dict, Any, Optional, List
import httpx

logger = logging.getLogger("supabase_db")


def get_supabase_config() -> Optional[Dict[str, str]]:
    """Retrieves Supabase URL and service/anon key from environment or .env."""
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_KEY", "")

    if not url or not key:
        # Check .env in parent and current directory
        candidate_paths = [
            os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"),
            os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"),
            ".env",
            "../.env"
        ]
        for env_path in candidate_paths:
            if os.path.exists(env_path):
                try:
                    with open(env_path, "r", encoding="utf-8") as f:
                        for line in f:
                            line = line.strip()
                            if not line or line.startswith("#"):
                                continue
                            if line.startswith("NEXT_PUBLIC_SUPABASE_URL=") or line.startswith("SUPABASE_URL="):
                                url = line.split("=", 1)[1].strip().strip("'\"")
                            elif line.startswith("SUPABASE_SERVICE_ROLE_KEY=") or line.startswith("NEXT_PUBLIC_SUPABASE_ANON_KEY=") or line.startswith("SUPABASE_KEY="):
                                key = line.split("=", 1)[1].strip().strip("'\"")
                except Exception:
                    pass

    if url and key:
        return {"url": url.rstrip("/"), "key": key}
    return None


def _get_headers(key: str) -> Dict[str, str]:
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation,resolution=merge-duplicates"
    }


def persist_dossier_to_supabase(
    dossier_code: str,
    master_hash: str,
    extracted: Dict[str, Any],
    evaluation: Dict[str, Any],
    angles_scanned: List[str] = None,
    remarks: str = None
) -> Optional[Dict[str, Any]]:
    """
    Persists an inspection test dossier, its violations, and angle metadata to Supabase cloud.
    Returns inserted dossier record or None.
    """
    cfg = get_supabase_config()
    if not cfg:
        logger.info("[Supabase] SUPABASE_URL not configured. Operating in local-only SQLite mode.")
        return None

    url = cfg["url"]
    key = cfg["key"]
    headers = _get_headers(key)

    try:
        # 1. Upsert Inspection Dossier
        dossier_payload = {
            "dossier_reference_code": dossier_code,
            "product_name": extracted.get("productName", "Packaged Commodity"),
            "brand_name": extracted.get("brandName", "Brand"),
            "category": extracted.get("category", "FOOD_BEVERAGES"),
            "packaging_geometry": extracted.get("packagingGeometry", "RECTANGULAR_BOX"),
            "container_height_mm": float(extracted.get("containerHeightMm", 160.0)),
            "container_width_mm": float(extracted.get("containerWidthMm")) if extracted.get("containerWidthMm") else None,
            "circumference_mm": float(extracted.get("circumferenceMm")) if extracted.get("circumferenceMm") else None,
            "pdp_area_cm2": float(extracted.get("pdpAreaCm2", 0.0)),
            "declared_net_quantity": float(extracted.get("netQuantityValue", 0.0)),
            "declared_net_unit": str(extracted.get("netQuantityUnit", "g")),
            "declared_mrp": float(extracted.get("mrpValue", 0.0)),
            "declared_usp_value": float(extracted.get("declaredUspValue")) if extracted.get("declaredUspValue") else None,
            "declared_usp_unit": extracted.get("declaredUspUnit"),
            "declared_mfg_month": int(extracted.get("mfgMonth")) if extracted.get("mfgMonth") else None,
            "declared_mfg_year": int(extracted.get("mfgYear")) if extracted.get("mfgYear") else None,
            "declared_exp_date": extracted.get("expiryDate"),
            "manufacturer_name": extracted.get("manufacturerName"),
            "manufacturer_address": extracted.get("manufacturerAddress"),
            "country_of_origin": extracted.get("countryOfOrigin", "India"),
            "consumer_care_phone": extracted.get("consumerCarePhone"),
            "consumer_care_email": extracted.get("consumerCareEmail"),
            "detected_font_height_mm": float(extracted.get("detectedNumeralHeightMm", 2.5)),
            "compliance_score": float(evaluation.get("complianceScore", 0)),
            "verdict": str(evaluation.get("verdict", "NON_COMPLIANT")),
            "master_sha256_hash": master_hash,
            "device_hardware_id": "COMPLISCAN-MOBILE-HUD",
            "is_tamper_evident": True,
            "is_synced_to_central": True,
            "inspector_remarks": remarks or extracted.get("inspectorRemarks")
        }

        resp = httpx.post(
            f"{url}/rest/v1/inspection_dossiers",
            headers=headers,
            json=dossier_payload,
            timeout=10.0
        )
        if resp.status_code not in [200, 201]:
            logger.warning(f"[Supabase] Dossier upsert returned {resp.status_code}: {resp.text[:200]}")
            return None

        inserted = resp.json()
        dossier_record = inserted[0] if isinstance(inserted, list) and len(inserted) > 0 else inserted
        dossier_id = dossier_record.get("id")
        logger.info(f"[Supabase] Successfully saved dossier {dossier_code} (ID: {dossier_id}) to Supabase.")

        # 2. Insert Violations
        violations = evaluation.get("violations", [])
        if dossier_id and violations:
            persist_violations_to_supabase(dossier_id, violations)

        # 3. Insert Angles
        if dossier_id and angles_scanned:
            angle_records = [
                {
                    "dossier_id": dossier_id,
                    "angle_type": angle,
                    "sha256_hash": master_hash,
                    "optical_width": 1080,
                    "optical_height": 1920
                }
                for angle in angles_scanned
            ]
            try:
                httpx.post(f"{url}/rest/v1/captured_angles", headers=headers, json=angle_records, timeout=5.0)
            except Exception as e:
                logger.warning(f"[Supabase] Non-fatal angle insert note: {e}")

        return dossier_record

    except Exception as e:
        logger.error(f"[Supabase] Error persisting to Supabase: {e}")
        return None


def persist_violations_to_supabase(dossier_id: str, violations: List[Dict[str, Any]]) -> bool:
    """Inserts violation records linked to an inspection dossier."""
    cfg = get_supabase_config()
    if not cfg:
        return False

    url = cfg["url"]
    key = cfg["key"]
    headers = _get_headers(key)

    v_records = [
        {
            "dossier_id": dossier_id,
            "statutory_rule_ref": v.get("ruleCode") or v.get("statutoryRuleRef") or "RULE",
            "severity": v.get("severity", "MEDIUM"),
            "violation_title": v.get("violationTitle") or v.get("defectDescription") or "Statutory Defect",
            "defect_description": v.get("defect") or v.get("defectDescription", ""),
            "detected_value": str(v.get("detected") or v.get("detectedValue") or "N/A"),
            "required_value": str(v.get("expected") or v.get("requiredValue") or "N/A")
        }
        for v in violations
    ]

    try:
        resp = httpx.post(f"{url}/rest/v1/violation_records", headers=headers, json=v_records, timeout=5.0)
        return resp.status_code in [200, 201]
    except Exception as e:
        logger.warning(f"[Supabase] Could not insert violations: {e}")
        return False


def log_test_run_to_supabase(test_name: str, test_type: str, status: str, details: Optional[Dict[str, Any]] = None) -> bool:
    """
    Logs test suite executions, AI benchmarks, and metrology test results into Supabase `test_runs`.
    """
    cfg = get_supabase_config()
    if not cfg:
        return False

    url = cfg["url"]
    key = cfg["key"]
    headers = _get_headers(key)

    payload = {
        "test_name": test_name,
        "test_type": test_type,
        "status": status,
        "details": details or {}
    }

    try:
        resp = httpx.post(
            f"{url}/rest/v1/test_runs",
            headers=headers,
            json=payload,
            timeout=5.0
        )
        if resp.status_code in [200, 201]:
            logger.info(f"[Supabase] Logged test run '{test_name}' ({status}) to Supabase.")
            return True
        return False
    except Exception as e:
        logger.warning(f"[Supabase] Could not log test run: {e}")
        return False


def fetch_dossiers_from_supabase(limit: int = 25) -> List[Dict[str, Any]]:
    """Retrieves recent inspection dossiers from Supabase Cloud."""
    cfg = get_supabase_config()
    if not cfg:
        return []

    url = cfg["url"]
    key = cfg["key"]
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
    }

    try:
        resp = httpx.get(
            f"{url}/rest/v1/inspection_dossiers?select=*,violation_records(*)&order=inspection_timestamp.desc&limit={limit}",
            headers=headers,
            timeout=10.0
        )
        if resp.status_code == 200:
            return resp.json()
        return []
    except Exception as e:
        logger.warning(f"[Supabase] Could not fetch dossiers: {e}")
        return []
