import os
import time
import requests
import json

sample_dir = r"c:\Users\ansh0\OneDrive\Desktop\compliscan\public\samples\yogabar"

front_path = os.path.join(sample_dir, "front.jpg")
back_path = os.path.join(sample_dir, "back.jpg")
reg_path = os.path.join(sample_dir, "regulatory.jpg")
mrp_path = os.path.join(sample_dir, "mrp_batch.jpg")

files = [
    ("front_image", ("front.jpg", open(front_path, "rb"), "image/jpeg")),
    ("back_image", ("back.jpg", open(back_path, "rb"), "image/jpeg")),
    ("regulatory_image", ("regulatory.jpg", open(reg_path, "rb"), "image/jpeg")),
    ("mrp_image", ("mrp.jpg", open(mrp_path, "rb"), "image/jpeg")),
]

data = {
    "geometry": "RECTANGULAR_BOX",
    "containerHeightMm": 200.0,
    "containerWidthMm": 140.0
}

print("Posting 4 sample images to http://localhost:8000/api/v1/inspection/scan ...")
t0 = time.time()
resp = requests.post("http://localhost:8000/api/v1/inspection/scan", files=files, data=data, timeout=120)
elapsed = time.time() - t0

print(f"Status Code: {resp.status_code}")
print(f"Total Response Latency: {elapsed:.2f} seconds")

if resp.status_code == 200:
    payload = resp.json()
    ext = payload.get("extractedData", {})
    comp = payload.get("comprehensiveDetails") or {}
    evaluation = payload.get("evaluation", {})
    ocrStats = payload.get("ocrStats", {})

    print("\n========== INSPECTION REPORT ==========")
    print(f"Dossier Code: {payload.get('dossierCode')}")
    print(f"Product Name: {ext.get('productName')}")
    print(f"Brand Name: {ext.get('brandName')}")
    print(f"Net Quantity: {ext.get('netQuantityValue')} {ext.get('netQuantityUnit')}")
    print(f"MRP: Rs. {ext.get('mrpValue')}")
    print(f"USP: Rs. {ext.get('declaredUspValue')} {ext.get('declaredUspUnit')}")
    print(f"Mfg Date: {ext.get('mfgDate')}")
    print(f"Batch No: {ext.get('batchNumber')}")
    print(f"Manufacturer: {ext.get('manufacturerName')}")
    print(f"Address: {ext.get('manufacturerAddress')}")
    print(f"Consumer Care Phone: {ext.get('consumerCarePhone')}")
    print(f"Consumer Care Email: {ext.get('consumerCareEmail')}")
    print(f"FSSAI Lic: {ext.get('fssaiLicenseNo')}")
    print(f"Compliance Score: {evaluation.get('complianceScore')}%")
    print(f"Verdict: {evaluation.get('verdict')}")
    print(f"Violations Count: {len(evaluation.get('violations', []))}")
    for v in evaluation.get('violations', []):
        print(f"  - [{v.get('severity')}] {v.get('statutoryRuleRef')}: {v.get('violationTitle')} - {v.get('defectDescription')}")
    print(f"OCR Stats: {ocrStats}")
    print("========================================")
else:
    print(f"API Error Response: {resp.text}")
