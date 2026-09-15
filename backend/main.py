"""
FastAPI Controller (backend/main.py)
Endpoints:
- POST /api/v1/inspection/scan (Multipart image ingestion, SHA-256 hashing, OpenCV enhancement, OCR, dynamic entity extraction, rule evaluation)
- POST /api/v1/inspection/export-pdf (Dynamic Section 63 BSA 2023 legal dossier PDF generation)
- GET /health (Health & status telemetry)
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
import hashlib
import json
import logging
from typing import Optional

import os
import sys

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from rule_engine import evaluate_legal_metrology
from ocr_pipeline import enhance_packaging_image, extract_text_lines
from extractor import parse_statutory_entities
from report_generator import build_judicial_pdf

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("compliscan-backend")

app = FastAPI(
    title="CompliScan AI Legal Metrology Engine",
    version="1.0.0",
    description="Dynamic Legal Metrology & Section 63 BSA Compliance API Service"
)

# Enable CORS for Next.js frontend communication
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
    return {
        "status": "healthy",
        "service": "CompliScan AI Legal Metrology Microservice",
        "engine": "OpenCV + Dynamic Entity Extractor + Legal Metrology Rules 2011/2026",
        "evidenceCompliance": "Section 63 Bharatiya Sakshya Adhiniyam, 2023"
    }


@app.post("/api/v1/inspection/scan")
async def scan_product_dossier(
    file: UploadFile = File(...),
    geometry: Optional[str] = Form(None),
    containerHeightMm: Optional[float] = Form(None),
    containerWidthMm: Optional[float] = Form(None),
    circumferenceMm: Optional[float] = Form(None)
):
    """
    Accepts packaged commodity photo, executes OpenCV glare reduction and OCR,
    extracts all statutory fields dynamically (no hardcoding), and returns evaluation results.
    """
    try:
        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Empty image upload payload.")

        # 1. Cryptographic SHA-256 evidence fingerprinting (Section 63 BSA 2023)
        sha256_hash = hashlib.sha256(image_bytes).hexdigest()

        # 2. OpenCV CLAHE glare reduction & bilateral denoising
        enhanced_image = enhance_packaging_image(image_bytes)

        # 3. Dynamic OCR line transcription
        detected_lines = extract_text_lines(enhanced_image)

        # 4. Universal Entity Parser (Handles Beverage, Solid, Household, Personal Care)
        extracted = parse_statutory_entities(detected_lines)

        # Apply geometry overrides from caller if provided
        if geometry:
            extracted["packagingGeometry"] = geometry
        if containerHeightMm is not None and containerHeightMm > 0:
            extracted["containerHeightMm"] = float(containerHeightMm)
        if containerWidthMm is not None and containerWidthMm > 0:
            extracted["containerWidthMm"] = float(containerWidthMm)
        if circumferenceMm is not None and circumferenceMm > 0:
            extracted["circumferenceMm"] = float(circumferenceMm)

        # 5. Deterministic Legal Metrology Rule Evaluation
        evaluation = evaluate_legal_metrology(extracted)

        dossier_code = f"LM-2026-{sha256_hash[:8].upper()}"

        return {
            "success": True,
            "dossierCode": dossier_code,
            "imageSha256": sha256_hash,
            "detectedLines": detected_lines,
            "extractedData": extracted,
            "evaluation": evaluation
        }

    except Exception as e:
        logger.error(f"Error processing inspection scan: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/inspection/export-pdf")
async def export_judicial_pdf(dossier_payload: dict):
    """
    Dynamically produces Section 63 BSA 2023 court-admissible PDF dossier.
    """
    try:
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
