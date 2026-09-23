"""
FastAPI Controller (backend/main.py)
Split-Path Tri-Core 4-Angle Inspection Architecture (SIH 26034)

Accepts multi-angle packaging inspection images:
  1. Front (Principal Display Panel: Brand, Name, Net Quantity)
  2. Back (Ingredients, License, Consumer Care)
  3. Regulatory Side (Manufacturer Name & Full Address with PIN, Country of Origin)
  4. MRP & Batch Stamp (MRP incl. of taxes, USP, Mfg/Exp Date, Batch No)

Concurrent Dispatch:
  - Path A: Multi-Angle Gemini 3.6 Flash VLM Semantic Synthesis
  - Path B: Multi-Angle 4-Stage Packaging Enhancement + PaddleOCR (use_angle_cls=True)
Cross-Validation:
  - Brain MD: Deterministic Anti-Hallucination Arbitration & Legal Metrology Engine

Statutory Evidence:
  - Section 63 Bharatiya Sakshya Adhiniyam, 2023
  - Legal Metrology (Packaged Commodities) Rules, 2011 & 2026 Amendments
"""

import os
import sys
os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"
os.environ["FLAGS_use_mkldnn"] = "0"
import hashlib
import asyncio
import logging
from typing import Optional, Dict, List, Any

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware

# Multi-Angle Split-Path Engines
from vlm_engine import (
    extract_comprehensive_details,
    extract_with_vlm_multi_angle,
    _load_gemini_key_from_env
)
from ocr_engine import extract_with_ocr_multi_angle
from master_brain import fuse_and_judge
from report_generator import build_judicial_pdf
from supabase_db import (
    persist_dossier_to_supabase,
    log_test_run_to_supabase,
    fetch_dossiers_from_supabase
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("compliscan-backend")

app = FastAPI(
    title="CompliScan AI Legal Metrology Engine",
    version="3.2.0",
    description="Split-Path Tri-Core Architecture: 4-Angle Ingestion (Front, Back, Regulatory, MRP) -> VLM + OCR -> Brain MD"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
@app.get("/health")
def health_check():
    vlm_available = bool(_load_gemini_key_from_env())
    return {
        "status": "healthy",
        "service": "CompliScan AI Legal Metrology Microservice — 4-Angle Split-Path Engine",
        "architecture": "4-Angle (Front, Back, Regulatory, MRP) -> Path A (VLM) + Path B (OCR) -> Brain MD",
        "paths": {
            "pathA_vlm_gemini_3_6": "ACTIVE" if vlm_available else "INACTIVE (no GEMINI_API_KEY)",
            "pathB_enhancer_ocr": "ACTIVE",
            "brainMD_judge": "ACTIVE",
        },
        "supportedPanels": ["FRONT", "BACK", "REGULATORY_SIDE", "MRP_BATCH"],
        "evidenceCompliance": "Section 63 Bharatiya Sakshya Adhiniyam, 2023"
    }


@app.post("/api/v1/inspection/scan")
async def scan_product_dossier(
    files: Optional[List[UploadFile]] = File(None),
    file: Optional[UploadFile] = File(None),
    front_image: Optional[UploadFile] = File(None),
    back_image: Optional[UploadFile] = File(None),
    regulatory_image: Optional[UploadFile] = File(None),
    mrp_image: Optional[UploadFile] = File(None),
    geometry: Optional[str] = Form(None),
    containerHeightMm: Optional[float] = Form(None),
    containerWidthMm: Optional[float] = Form(None),
    circumferenceMm: Optional[float] = Form(None)
):
    """
    Multi-Image Packaging Inspection Endpoint:
    Accepts multiple packaging files (Front, Back, Regulatory, MRP) in a list or named parameters.
    Sends all images simultaneously in a single API call to Gemini 1.5 Flash (Path A),
    processes multi-angle OCR in parallel (Path B), and performs Master Brain arbitration.
    """
    try:
        image_bytes_list: List[bytes] = []
        angle_images: Dict[str, bytes] = {}

        # 1. Ingest files list if provided
        if files:
            for idx, f in enumerate(files):
                b = await f.read()
                if b:
                    image_bytes_list.append(b)
                    panel_label = ["FRONT", "BACK", "REGULATORY_SIDE", "MRP_BATCH"][idx] if idx < 4 else f"PANEL_{idx+1}"
                    angle_images[panel_label] = b

        # 2. Ingest individual angle parameters if provided
        if front_image:
            fb = await front_image.read()
            if fb:
                angle_images["FRONT"] = fb
                if fb not in image_bytes_list:
                    image_bytes_list.append(fb)

        if back_image:
            bb = await back_image.read()
            if bb:
                angle_images["BACK"] = bb
                if bb not in image_bytes_list:
                    image_bytes_list.append(bb)

        if regulatory_image:
            rb = await regulatory_image.read()
            if rb:
                angle_images["REGULATORY_SIDE"] = rb
                if rb not in image_bytes_list:
                    image_bytes_list.append(rb)

        if mrp_image:
            mb = await mrp_image.read()
            if mb:
                angle_images["MRP_BATCH"] = mb
                if mb not in image_bytes_list:
                    image_bytes_list.append(mb)

        # 3. Single file fallback
        if not image_bytes_list and file:
            single_b = await file.read()
            if single_b:
                image_bytes_list.append(single_b)
                angle_images["FRONT"] = single_b

        if not image_bytes_list:
            raise HTTPException(status_code=400, detail="No valid packaging images uploaded.")

        # Compute combined SHA-256 evidence hash from all uploaded images
        combined_hasher = hashlib.sha256()
        for b in image_bytes_list:
            combined_hasher.update(b)
        primary_hash = combined_hasher.hexdigest()

        panel_summary = list(angle_images.keys()) if angle_images else [f"PANEL_{i+1}" for i in range(len(image_bytes_list))]
        logger.info(
            f"[SCAN] Ingested {len(image_bytes_list)} packaging image(s): {panel_summary}. "
            f"Evidence SHA-256: {primary_hash[:16]}... Launching Multi-Image Split-Path execution..."
        )

        # ── Parallel Execution: Path A (Multi-Image VLM) and Path B (Enhanced OCR) ────
        path_a_task = asyncio.to_thread(extract_comprehensive_details, image_bytes_list)
        path_b_task = asyncio.to_thread(
            extract_with_ocr_multi_angle,
            angle_images,
            geometry=geometry,
            container_height_mm=containerHeightMm,
            container_width_mm=containerWidthMm,
            circumference_mm=circumferenceMm
        )

        vlm_result, ocr_result = await asyncio.gather(path_a_task, path_b_task)

        if vlm_result:
            logger.info(
                f"[PATH A: VLM] Completed multi-image synthesis — "
                f"Product: '{vlm_result.get('productName')}', Brand: '{vlm_result.get('brandName')}', "
                f"MRP: {vlm_result.get('mrpValue')}, NetQty: {vlm_result.get('netQuantityValue')} {vlm_result.get('netQuantityUnit')}"
            )
        else:
            logger.info("[PATH A: VLM] Skipped or returned null (running in OCR verification mode)")

        lines_count = len(ocr_result.get("rawTextStrings", []))
        logger.info(
            f"[PATH B: OCR] Completed multi-panel OCR — {lines_count} lines across {len(angle_images)} sides | "
            f"Font Height: {ocr_result.get('detectedNumeralHeightMm')} mm | PDP Area: {ocr_result.get('pdpAreaCm2')} cm²"
        )

        if lines_count == 0 and not vlm_result:
            raise HTTPException(
                status_code=400,
                detail="No packaging typography detected on uploaded panels. "
                       "Please ensure proper lighting and orientation."
            )

        # ── Step 4: Brain MD / Cross-Validation Judge ─────────────────────
        logger.info("[BRAIN MD] Cross-validating multi-image VLM and OCR extractions...")
        verdict_json = fuse_and_judge(vlm_result, ocr_result)

        dossier_code = f"LM-2026-{primary_hash[:8].upper()}"

        comprehensive_data = verdict_json["extractedData"].get("comprehensiveDetails") or (vlm_result.get("comprehensiveDetails") if vlm_result else None)

        response_payload = {
            "success": True,
            "dossierCode": dossier_code,
            "imageSha256": primary_hash,
            "architecture": "MULTI_IMAGE_SPLIT_PATH_VLM_OCR",
            "panelsProcessed": panel_summary,
            "imagesCount": len(image_bytes_list),
            "ocrStats": ocr_result.get("ocrStats", {}),
            "detectedLines": ocr_result.get("rawTextStrings", []),
            "rawTextStrings": ocr_result.get("rawTextStrings", []),
            "boundingBoxes": ocr_result.get("boundingBoxes", []),
            "extractedData": verdict_json["extractedData"],
            "comprehensiveDetails": comprehensive_data,
            "evaluation": verdict_json["evaluation"],
            "triCoreMetadata": verdict_json["triCoreMetadata"],
        }

        logger.info(
            f"[VERDICT] Compiled Dossier {dossier_code} — "
            f"Score: {verdict_json['evaluation']['complianceScore']}% | "
            f"Verdict: {verdict_json['evaluation']['verdict']} | "
            f"Hallucinations Blocked: {verdict_json['triCoreMetadata']['hallucinationsBlocked']}"
        )

        # ── Step 5: Background Cloud Persistence (Supabase) ───────────────
        try:
            supabase_record = persist_dossier_to_supabase(
                dossier_code=dossier_code,
                master_hash=primary_hash,
                extracted=verdict_json["extractedData"],
                evaluation=verdict_json["evaluation"],
                angles_scanned=panel_summary
            )
            response_payload["supabaseSynced"] = bool(supabase_record)
            if supabase_record:
                response_payload["supabaseId"] = supabase_record.get("id")

            # Log test telemetry to Supabase test_runs
            log_test_run_to_supabase(
                test_name=f"SPLIT_PATH_SCAN_{dossier_code}",
                test_type="TRI_CORE",
                status="PASSED" if verdict_json["evaluation"]["complianceScore"] > 0 else "FAILED",
                details={
                    "panels": panel_summary,
                    "score": verdict_json["evaluation"]["complianceScore"],
                    "verdict": verdict_json["evaluation"]["verdict"],
                    "violationsCount": len(verdict_json["evaluation"]["violations"])
                }
            )
        except Exception as se:
            logger.warning(f"[Supabase] Non-fatal auto-sync notice: {se}")
            response_payload["supabaseSynced"] = False

        return response_payload

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error executing 4-angle inspection scan: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/inspection/save-dossier")
async def save_or_update_dossier(payload: dict):
    """
    Saves or updates an inspection dossier in Supabase with editable inspector declarations.
    """
    try:
        dossier_code = payload.get("dossierCode") or f"LM-2026-MANUAL"
        master_hash = payload.get("masterSha256Hash") or payload.get("imageSha256", "HASH")
        extracted = payload.get("extractedData", {})
        evaluation = payload.get("evaluation", {})
        remarks = payload.get("inspectorRemarks") or extracted.get("inspectorRemarks")
        angles = payload.get("panelsProcessed", ["FRONT"])

        result = persist_dossier_to_supabase(
            dossier_code=dossier_code,
            master_hash=master_hash,
            extracted=extracted,
            evaluation=evaluation,
            angles_scanned=angles,
            remarks=remarks
        )

        return {
            "success": bool(result),
            "dossierCode": dossier_code,
            "supabaseSynced": bool(result)
        }
    except Exception as e:
        logger.error(f"Error updating dossier in Supabase: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/inspection/supabase-dossiers")
async def get_supabase_dossiers(limit: int = 25):
    """
    Retrieves stored dossiers from Supabase database.
    """
    records = fetch_dossiers_from_supabase(limit=limit)
    return {"success": True, "count": len(records), "dossiers": records}


@app.post("/api/v1/tests/log")
async def log_test_execution(payload: dict):
    """
    Endpoint for automated test suites to record test runs in Supabase.
    """
    test_name = payload.get("testName", "UNKNOWN_TEST")
    test_type = payload.get("testType", "UNIT")
    status = payload.get("status", "PASSED")
    details = payload.get("details", {})

    success = log_test_run_to_supabase(test_name, test_type, status, details)
    return {"success": success}


@app.post("/api/v1/inspection/export-pdf")
async def export_judicial_pdf(dossier_payload: dict):
    """
    Dynamically produces Section 63 BSA 2023 court-admissible PDF dossier with edited inspector observations.
    """
    try:
        # Also persist latest inspector modifications to Supabase if available
        dossier_code = dossier_payload.get('dossierCode')
        if dossier_code and dossier_payload.get('extractedData'):
            persist_dossier_to_supabase(
                dossier_code=dossier_code,
                master_hash=dossier_payload.get('imageSha256', 'HASH'),
                extracted=dossier_payload.get('extractedData', {}),
                evaluation=dossier_payload.get('evaluation', {}),
                remarks=dossier_payload.get('inspectorRemarks')
            )

        pdf_bytes = build_judicial_pdf(dossier_payload)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=CompliScan_{dossier_payload.get('dossierCode', 'Dossier')}.pdf"
            }
        )
    except Exception as e:
        logger.error(f"Error generating PDF dossier: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
