import os
import sys
import io
import json

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from vlm_engine import extract_comprehensive_details

IMAGE_DIR = r"C:\Users\ansh0\.gemini\antigravity-ide\brain\8a97aed5-b0c4-4b8a-922e-b073b7a5f1a7\.user_uploaded"
files = ["media_1789990611656.jpg", "media_1789990611803.jpg", "media_1789990611856.jpg", "media_1789990642776.jpg"]

bytes_list = []
for f in files:
    with open(os.path.join(IMAGE_DIR, f), "rb") as fp:
        bytes_list.append(fp.read())

print(f"Calling Gemini with {len(bytes_list)} images...", flush=True)
result = extract_comprehensive_details(bytes_list)
print("=== RESULT ===", flush=True)
print(json.dumps(result, indent=2, default=str), flush=True)
