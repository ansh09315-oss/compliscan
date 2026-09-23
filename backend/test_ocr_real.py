import os
import sys
import io
import json

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"
os.environ["FLAGS_use_mkldnn"] = "0"
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ocr_engine import extract_with_ocr_multi_angle

IMAGE_DIR = r"C:\Users\ansh0\.gemini\antigravity-ide\brain\8a97aed5-b0c4-4b8a-922e-b073b7a5f1a7\.user_uploaded"

files = {
    "MRP_BATCH": "media_1789990611656.jpg",
    "BACK": "media_1789990611803.jpg",
    "FRONT": "media_1789990611856.jpg",
    "REGULATORY_SIDE": "media_1789990642776.jpg"
}

angle_images = {}
for k, fname in files.items():
    with open(os.path.join(IMAGE_DIR, fname), "rb") as f:
        angle_images[k] = f.read()

print("Running OCR on 4 real packaging photos...", flush=True)
ocr_res = extract_with_ocr_multi_angle(angle_images)
print(f"Extracted {len(ocr_res['rawTextStrings'])} raw lines!", flush=True)
print("\nExtracted Fields:")
print(json.dumps(ocr_res['extractedFields'], indent=2, default=str), flush=True)
print("\nRaw Text Samples (first 30):")
for line in ocr_res['rawTextStrings'][:30]:
    print("  ->", line, flush=True)
