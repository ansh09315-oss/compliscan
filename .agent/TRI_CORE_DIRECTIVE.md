# MISSION: TRI-CORE HYBRID ARCHITECTURE FOR SIH 26034
Target Directory: C:\Users\ansh0\OneDrive\Desktop\compliscan
Objective: Implement a production-ready, 3-tier inspection system for Packaged Commodities compliance (Legal Metrology Rules, 2011). Replace the existing mock data with this robust pipeline.

## ARCHITECTURE SPECIFICATION
The system must be split into three distinct, modular engines to ensure data privacy, prevent AI hallucination in legal calculations, and handle unstructured layouts:

### Engine 1: The Semantic Brain (VLM) -> `backend/vlm_engine.py`
- Tool: `google-generativeai` (Gemini 1.5 Flash).
- Role: Extract semantic meaning from the packaging image.
- Input: Image bytes.
- Output: Strict JSON (productName, category, netQuantityValue, netQuantityUnit, mrpValue, mfgDate, manufacturerName, consumerCare).
- Constraint: Prompt must strictly instruct the AI NOT to guess or hallucinate. Return `null` if a field is missing.

### Engine 2: The Geometric Measuring Tape (OCR) -> `backend/ocr_engine.py`
- Tool: `paddleocr`, `opencv-python`.
- Role: Measure physical dimensions and calculate text bounding box heights.
- Input: Image bytes, package dimensions (Height, Width/Circumference).
- Output: JSON containing `pdpAreaCm2` and `detectedNumeralHeightMm`.
- Constraint: Do not use OCR text for semantic extraction, only use it to find the smallest/largest numeral height for Rule 7 compliance.

### Engine 3: The Master Brain (Legal Judge) -> `backend/master_brain.py`
- Tool: Pure Python deterministic logic (NO AI).
- Role: Take JSON from Engine 1 & Engine 2, and apply Legal Metrology Rules mathematically.
- Rules to apply:
  1. Rule 6(11) USP Calculation: Check if MRP and Net Qty yield the correct Unit Sale Price.
  2. Rule 7: Compare `detectedNumeralHeightMm` from Engine 2 against the statutory threshold for the calculated `pdpAreaCm2`.
  3. Rule 6(1)(a) & 6(2): Check if manufacturer and consumer care exist from Engine 1.
- Output: Final Verdict JSON (Score, Verdict, Violations List).
