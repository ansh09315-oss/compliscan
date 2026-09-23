"""
Debug Real Images with VLM and OCR Pipeline
"""
import os
import sys
import io

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"
os.environ["FLAGS_use_mkldnn"] = "0"
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import json
from vlm_engine import extract_comprehensive_details
from ocr_engine import extract_with_ocr_multi_angle
from master_brain import fuse_and_judge

IMAGE_DIR = r"C:\Users\ansh0\.gemini\antigravity-ide\brain\8a97aed5-b0c4-4b8a-922e-b073b7a5f1a7\.user_uploaded"

def main():
    image_files = [
        "media_1789990611656.jpg",
        "media_1789990611803.jpg",
        "media_1789990611856.jpg",
        "media_1789990642776.jpg"
    ]

    bytes_list = []
    angle_dict = {}
    labels = ["MRP_BATCH", "BACK", "FRONT", "BACK_ZOOM"]

    for idx, fname in enumerate(image_files):
        fpath = os.path.join(IMAGE_DIR, fname)
        if os.path.exists(fpath):
            with open(fpath, "rb") as f:
                b = f.read()
                bytes_list.append(b)
                angle_dict[labels[idx]] = b
            print(f"Loaded {fname}: {len(b)} bytes")
        else:
            print(f"File not found: {fpath}")

    print(f"\n--- Testing VLM with {len(bytes_list)} real images ---")
    vlm_result = extract_comprehensive_details(bytes_list)
    print("VLM Result:")
    print(json.dumps(vlm_result, indent=2, default=str))

    print("\n--- Testing OCR on real images ---")
    ocr_result = extract_with_ocr_multi_angle(angle_dict)
    print(f"OCR Detected {len(ocr_result.get('rawTextStrings', []))} lines")
    print("Sample lines:", ocr_result.get('rawTextStrings', [])[:20])

    print("\n--- Testing Master Brain Fusion ---")
    verdict = fuse_and_judge(vlm_result, ocr_result)
    print("Final Verdict Extracted Data:")
    print(json.dumps(verdict["extractedData"], indent=2, default=str))
    print("Evaluation:")
    print(json.dumps(verdict["evaluation"], indent=2, default=str))

if __name__ == "__main__":
    main()
