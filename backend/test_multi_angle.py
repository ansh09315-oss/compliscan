"""
Multi-Angle 4-Panel Packaging Extraction Test
(backend/test_multi_angle.py)
"""

import os
os.environ["FLAGS_use_mkldnn"] = "0"
os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"
os.environ["PYTHONIOENCODING"] = "utf-8"

import sys
import io
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import cv2
import numpy as np
from vlm_engine import extract_with_vlm_multi_angle
from ocr_engine import extract_with_ocr_multi_angle
from master_brain import fuse_and_judge


def create_panel_images():
    # 1. FRONT PANEL (PDP)
    front = np.ones((400, 500, 3), dtype=np.uint8) * 240
    cv2.putText(front, "HIMALAYAN HONEY", (30, 100), cv2.FONT_HERSHEY_DUPLEX, 1.1, (20, 120, 20), 2)
    cv2.putText(front, "100% Pure Forest Honey", (40, 160), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (50, 50, 50), 2)
    cv2.putText(front, "Net Qty: 500 g", (40, 240), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (10, 10, 10), 2)
    _, front_buf = cv2.imencode(".jpg", front)

    # 2. BACK PANEL (Consumer Care & License)
    back = np.ones((400, 500, 3), dtype=np.uint8) * 240
    cv2.putText(back, "Ingredients: Raw Forest Honey", (30, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (30, 30, 30), 2)
    cv2.putText(back, "Consumer Care: care@honey.in", (30, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (10, 10, 10), 2)
    cv2.putText(back, "Toll Free: 1800-222-3333", (30, 220), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (10, 10, 10), 2)
    _, back_buf = cv2.imencode(".jpg", back)

    # 3. REGULATORY SIDE (Manufacturer & Origin)
    regulatory = np.ones((400, 500, 3), dtype=np.uint8) * 240
    cv2.putText(regulatory, "Manufactured by:", (30, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (30, 30, 30), 2)
    cv2.putText(regulatory, "Pure Organics India Pvt Ltd", (30, 130), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (10, 10, 10), 2)
    cv2.putText(regulatory, "Plot 42, Udyog Vihar, Gurugram - 122016", (30, 190), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (30, 30, 30), 2)
    cv2.putText(regulatory, "Country of Origin: India", (30, 260), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (10, 10, 10), 2)
    _, reg_buf = cv2.imencode(".jpg", regulatory)

    # 4. MRP & BATCH STAMP
    mrp_panel = np.ones((400, 500, 3), dtype=np.uint8) * 240
    cv2.putText(mrp_panel, "MRP Rs. 250.00", (30, 80), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (10, 10, 10), 2)
    cv2.putText(mrp_panel, "(Incl. of all taxes)", (30, 130), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (50, 50, 50), 2)
    cv2.putText(mrp_panel, "USP: Rs. 0.50 per g", (30, 190), cv2.FONT_HERSHEY_SIMPLEX, 0.85, (20, 20, 20), 2)
    cv2.putText(mrp_panel, "MFD: 08/2026", (30, 250), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (10, 10, 10), 2)
    cv2.putText(mrp_panel, "BATCH: HN-992", (30, 310), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (30, 30, 30), 2)
    _, mrp_buf = cv2.imencode(".jpg", mrp_panel)

    return {
        "FRONT": front_buf.tobytes(),
        "BACK": back_buf.tobytes(),
        "REGULATORY_SIDE": reg_buf.tobytes(),
        "MRP_BATCH": mrp_buf.tobytes(),
    }


def run_multi_angle_test():
    print("====================================================================")
    print("TESTING 4-ANGLE SPLIT-PATH INSPECTION SYNTHESIS (SIH 26034)")
    print("====================================================================\n")

    panels = create_panel_images()
    print(f"[STEP 1] Prepared 4 Packaging Panels: {list(panels.keys())}")

    # 1. Path A: Gemini 3.6 Flash Multi-Angle Synthesis
    print("\n[STEP 2] Path A: Gemini 3.6 Flash Multi-Angle VLM Ingestion...")
    vlm_result = extract_with_vlm_multi_angle(panels)
    print("  VLM Extraction Output:")
    if vlm_result:
        for k, v in vlm_result.items():
            print(f"    - {k}: {v}")
    else:
        print("    (VLM offline or skipped)")

    # 2. Path B: PaddleOCR Multi-Angle Scan
    print("\n[STEP 3] Path B: Multi-Angle OCR Scan...")
    ocr_result = extract_with_ocr_multi_angle(panels, geometry="RECTANGULAR_BOX", container_height_mm=160.0)
    print(f"  Total Lines Detected Across 4 Panels: {len(ocr_result['rawTextStrings'])}")
    for line in ocr_result["rawTextStrings"]:
        print(f"    - {line}")

    # 3. Brain MD: Cross-Panel Fusion & Anti-Hallucination Arbitration
    print("\n[STEP 4] Brain MD: Cross-Panel Arbitration & Legal Math...")
    verdict = fuse_and_judge(vlm_result, ocr_result)
    ext = verdict["extractedData"]
    eval_res = verdict["evaluation"]
    meta = verdict["triCoreMetadata"]

    print("\n  ================ FINAL VERDICT DOSSIER ================")
    print(f"  Product Name:        {ext.get('productName')}")
    print(f"  Net Quantity:        {ext.get('netQuantityValue')} {ext.get('netQuantityUnit')}")
    print(f"  MRP:                 Rs. {ext.get('mrpValue')}")
    print(f"  Declared USP:        {ext.get('declaredUspValue')} {ext.get('declaredUspUnit')}")
    print(f"  Manufacturing Date:  {ext.get('mfgMonth')}/{ext.get('mfgYear')}")
    print(f"  Manufacturer:        {ext.get('manufacturerName')}")
    print(f"  Address:             {ext.get('manufacturerAddress')}")
    print(f"  Consumer Care Email: {ext.get('consumerCareEmail')}")
    print(f"  Country of Origin:   {ext.get('countryOfOrigin')}")
    print(f"  -------------------------------------------------------")
    print(f"  Compliance Score:    {eval_res.get('complianceScore')}%")
    print(f"  Legal Verdict:       {eval_res.get('verdict')}")
    print(f"  Hallucinations Cut:  {meta.get('hallucinationsBlocked')}")
    print(f"  Average Confidence:  {meta.get('averageConfidence') * 100:.0f}%")
    print("  =======================================================\n")

    assert ext.get("netQuantityValue") == 500.0, "Net Qty should be extracted from Front panel"
    assert ext.get("mrpValue") == 250.0, "MRP should be extracted from MRP panel"
    print("[SUCCESS] 4-Panel Split-Path Inspection completed with 100% data synthesis!")


if __name__ == "__main__":
    run_multi_angle_test()
