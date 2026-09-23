"""
Quick Verification Test for Multi-Image Contextual VLM Engine
(backend/test_comprehensive_vlm.py)
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
from vlm_engine import (
    STRICT_MULTI_IMAGE_PROMPT,
    _clean_and_parse_json,
    _flatten_comprehensive_schema,
    extract_comprehensive_details
)
from master_brain import fuse_and_judge

def test_vlm_comprehensive_logic():
    print("Testing Multi-Image VLM Parsing & Flattening...")

    sample_output = """
    ```json
    {
      "productOverview": {
        "brandName": "True Elements",
        "productName": "Rolled Oats",
        "variant": "Gluten Free",
        "dietaryClassification": "Vegetarian",
        "keyClaims": ["100% Whole Grain", "High Fibre", "No Added Sugar"]
      },
      "pricingAndBatch": {
        "netWeight": "500 g",
        "mrp": 295.00,
        "usp": "Rs. 0.59/g",
        "mfgDate": "01/2026",
        "useByDate": "12/2026",
        "lotOrBatchNo": "TE-RO-2601",
        "barcode": "8906079940123"
      },
      "nutritionalInfoPer100g": {
        "energyKcal": 389.0,
        "proteinG": 13.0,
        "totalCarbohydrateG": 66.0,
        "totalSugarG": 0.5,
        "addedSugarG": 0.0,
        "totalFatG": 6.5
      },
      "ingredientsAndAllergens": {
        "ingredientsList": "Rolled Oats (100%)",
        "allergenAdvice": "Contains Oats. Packed in a facility handling nuts.",
        "manufacturingWarning": "Facility processes tree nuts and seeds."
      },
      "manufacturerDetails": {
        "companyName": "HW Wellness Solutions Pvt Ltd",
        "completeAddress": "Survey No 254, Hinjewadi Phase 2, Pune, Maharashtra - 411057",
        "fssaiLicenseNo": "11521998000123",
        "customerCarePhone": "1800-123-4567",
        "customerCareEmail": "care@trueelements.com"
      }
    }
    ```
    """

    parsed = _clean_and_parse_json(sample_output)
    assert parsed is not None, "Failed to parse JSON with markdown fences"
    assert parsed["productOverview"]["brandName"] == "True Elements"
    print("  [OK] Markdown fence cleaning passed.")

    # Test regex fallback with extra text
    dirty_output = "Here is the extracted inspection report: " + json.dumps(parsed) + " Note: All values verified."
    parsed_dirty = _clean_and_parse_json(dirty_output)
    assert parsed_dirty is not None, "Failed to parse JSON using regex fallback"
    print("  [OK] Regex fallback parse passed.")

    # Test schema flattening
    flattened = _flatten_comprehensive_schema(parsed)
    assert flattened["productName"] == "Rolled Oats"
    assert flattened["brandName"] == "True Elements"
    assert flattened["netQuantityValue"] == 500.0
    assert flattened["netQuantityUnit"] == "g"
    assert flattened["mrpValue"] == 295.0
    assert flattened["declaredUspValue"] == 0.59
    assert flattened["mfgMonth"] == 1
    assert flattened["mfgYear"] == 2026
    assert flattened["fssaiLicenseNo"] == "11521998000123"
    assert "comprehensiveDetails" in flattened
    print("  [OK] Schema flattening and legal metrology field mapping passed.")

    # Test Master Brain fusion
    mock_ocr = {
        "rawTextStrings": ["TRUE ELEMENTS", "ROLLED OATS", "NET WT 500g", "MRP Rs 295.00", "01/2026", "FSSAI 11521998000123"],
        "boundingBoxes": [],
        "detectedNumeralHeightMm": 3.2,
        "pdpAreaCm2": 150.0,
        "extractedFields": {}
    }
    verdict = fuse_and_judge(flattened, mock_ocr)
    assert verdict["extractedData"]["productName"] == "Rolled Oats"
    assert verdict["extractedData"]["comprehensiveDetails"] is not None
    assert verdict["extractedData"]["fssaiLicenseNo"] == "11521998000123"
    print(f"  [OK] Master Brain fusion passed: Score={verdict['evaluation']['complianceScore']}% | Verdict={verdict['evaluation']['verdict']}")
    print("\nALL COMPREHENSIVE VLM TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_vlm_comprehensive_logic()
