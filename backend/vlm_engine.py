"""
Engine 1: The Semantic Brain — Multi-Image Contextual VLM Engine
(backend/vlm_engine.py)

Uses Google Generative AI (Gemini 2.5 Flash / 2.0 Flash / 1.5 Flash) to process multiple
packaging images (Front, Back, Side, Batch) simultaneously in an asynchronous, non-blocking pipeline.
Features:
- Dynamic image pre-processing (downsampling to <=1280px and compressing to strictly <1MB).
- Async execution with Tenacity / exponential backoff retry on transient API failures.
- Non-blocking concurrent Pass-2 targeted recovery for missing packaging declarations.
- Resilient non-fatal fallback: Never crashes the pipeline if VLM is unavailable or rate-limited.
"""

import os
import io
import re
import json
import logging
import sys
import asyncio
from typing import Dict, Any, Optional, List, Union
from PIL import Image

# UTF-8 stdout configuration for Windows CP1252 / Linux UTF-8 compatibility
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

import google.generativeai as genai

# Tenacity resilient retry imports with graceful fallback
try:
    from tenacity import (
        retry,
        stop_after_attempt,
        wait_exponential,
        retry_if_exception_type,
        before_sleep_log
    )
    TENACITY_AVAILABLE = True
except ImportError:
    TENACITY_AVAILABLE = False

logger = logging.getLogger("vlm_engine")

# Ensure Protocol Buffers python implementation for PaddleOCR coexistence
os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"


def _load_gemini_key_from_env() -> str:
    """Reads GEMINI_API_KEY from environment or .env files."""
    if os.environ.get("GEMINI_API_KEY"):
        return os.environ.get("GEMINI_API_KEY", "").strip()

    candidate_paths = [
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"),
        os.path.join(os.getcwd(), ".env")
    ]
    for path in candidate_paths:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            if k.strip() == "GEMINI_API_KEY":
                                key = v.strip().strip("'\"")
                                if key:
                                    os.environ["GEMINI_API_KEY"] = key
                                    return key
            except Exception:
                pass
    return ""


# Configure default Gemini API Key with REST transport for Windows stability
_API_KEY = _load_gemini_key_from_env()
if _API_KEY:
    try:
        genai.configure(api_key=_API_KEY, transport="rest")
    except Exception as e:
        logger.warning(f"Failed to configure genai: {e}")


def _to_pil_image(img_input: Any) -> Optional[Image.Image]:
    """Converts bytes, file objects, or numpy arrays into a PIL Image."""
    if img_input is None:
        return None
    if isinstance(img_input, Image.Image):
        return img_input
    if isinstance(img_input, bytes):
        try:
            return Image.open(io.BytesIO(img_input))
        except Exception as e:
            logger.warning(f"Could not convert bytes to PIL image: {e}")
            return None
    if hasattr(img_input, "read"):
        try:
            return Image.open(img_input)
        except Exception as e:
            logger.warning(f"Could not read image file object: {e}")
            return None
    try:
        import numpy as np
        if isinstance(img_input, np.ndarray):
            if len(img_input.shape) == 3 and img_input.shape[2] == 3:
                import cv2
                rgb = cv2.cvtColor(img_input, cv2.COLOR_BGR2RGB)
                return Image.fromarray(rgb)
            return Image.fromarray(img_input)
    except Exception:
        pass
    return None


# ─────────────────────────────────────────────────────────────────────────────
# 1. High-Performance Image Preprocessing (Under 1MB & Max 1280px)
# ─────────────────────────────────────────────────────────────────────────────

def preprocess_image_for_vlm(
    img_input: Any,
    max_dimension: int = 1280,
    max_bytes: int = 1048576  # 1 MB
) -> Optional[Image.Image]:
    """
    Dynamically compresses and downsamples packaging panel images to strictly
    under 1MB and max dimension 1280px before passing to Gemini VLM.
    - Eliminates HTTP payload timeouts and API quota overflow.
    - Preserves high-contrast character edges for micro-text statutory declarations.
    - Operates safely on RGB images (stripping transparency alpha channels).
    """
    img = _to_pil_image(img_input)
    if img is None:
        return None

    try:
        # 1. Normalize color mode to RGB
        if img.mode != "RGB":
            img = img.convert("RGB")

        # 2. Proportionally resize if either dimension exceeds max_dimension
        orig_w, orig_h = img.size
        if orig_w > max_dimension or orig_h > max_dimension:
            scale = max_dimension / max(orig_w, orig_h)
            new_w = max(1, int(orig_w * scale))
            new_h = max(1, int(orig_h * scale))
            img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)

        # 3. Dynamic iterative JPEG compression to guarantee under 1MB
        quality = 85
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=quality, optimize=True)

        # If payload still exceeds 1MB, reduce quality progressively
        while buf.tell() > max_bytes and quality > 35:
            quality -= 15
            buf.seek(0)
            buf.truncate()
            img.save(buf, format="JPEG", quality=quality, optimize=True)

        # If still exceeding 1MB (e.g. extremely noisy patterns), downscale further
        if buf.tell() > max_bytes:
            cur_w, cur_h = img.size
            img = img.resize((int(cur_w * 0.75), int(cur_h * 0.75)), Image.Resampling.LANCZOS)
            buf.seek(0)
            buf.truncate()
            img.save(buf, format="JPEG", quality=60, optimize=True)

        buf.seek(0)
        final_img = Image.open(buf)
        final_img.load()
        return final_img
    except Exception as e:
        logger.warning(f"[VLM Preprocessor] Error preprocessing image: {e}")
        return img


# ─────────────────────────────────────────────────────────────────────────────
# 2. The Strict JSON System Prompt
# ─────────────────────────────────────────────────────────────────────────────

STRICT_MULTI_IMAGE_PROMPT = """You are a Master Legal Metrology and Food Safety (FSSAI) Inspector. 
I am providing you with multiple images of the EXACT SAME packaged commodity from different angles (Front, Back, MRP/Batch panel, Regulatory panel).

YOUR TASK:
Analyze all images SIMULTANEOUSLY. Information is fragmented across these panels. You must cross-reference the images and stitch the fragmented data together to build a complete product profile for the specific item shown in the images.
Extract whatever brand, product name, net quantity, MRP, dates, and manufacturer details are actually printed on the packaging.
DO NOT hallucinate or copy examples. If a piece of information is genuinely missing across all images, return `null`.

OUTPUT FORMAT:
Return ONLY a valid JSON object matching this exact schema. Do not include markdown formatting (like ```json).

{
  "productOverview": {
    "brandName": "Exact brand or company name printed on front",
    "productName": "Exact trade or commercial product name printed on front",
    "variant": "Flavor or variant name if any, else null",
    "dietaryClassification": "Vegetarian/Non-Vegetarian/Vegan based on green/brown logo",
    "keyClaims": ["List of marketing or health claims printed on pack"]
  },
  "pricingAndBatch": {
    "netWeight": "Net quantity with unit as printed (e.g. '100 g', '1 kg', '500 ml')",
    "mrp": "Numeric MRP float without currency symbols",
    "usp": "Unit sale price string with unit if printed, else null",
    "mfgDate": "Manufacturing or packing date as printed, else null",
    "useByDate": "Expiry or use by date as printed, else null",
    "lotOrBatchNo": "Batch, Lot, or Code number as printed, else null",
    "barcode": "Barcode number if visible, else null"
  },
  "nutritionalInfoPer100g": {
    "energyKcal": "Float or null",
    "proteinG": "Float or null",
    "totalCarbohydrateG": "Float or null",
    "totalSugarG": "Float or null",
    "addedSugarG": "Float or null",
    "totalFatG": "Float or null"
  },
  "ingredientsAndAllergens": {
    "ingredientsList": "Full comma-separated string of ingredients printed",
    "allergenAdvice": "Allergen advice string, else null",
    "manufacturingWarning": "Facility or cross-contamination warning, else null"
  },
  "manufacturerDetails": {
    "companyName": "Exact manufacturer, packer, or marketer company name",
    "completeAddress": "Full physical factory or corporate address with PIN code",
    "fssaiLicenseNo": "14-digit FSSAI license number if food product, else null",
    "customerCarePhone": "Helpline phone number if printed, else null",
    "customerCareEmail": "Consumer care email address if printed, else null"
  }
}
"""


def _clean_and_parse_json(raw_text: str) -> Optional[Dict[str, Any]]:
    """Cleans markdown formatting and parses JSON with robust fallback regex."""
    if not raw_text:
        return None

    cleaned = raw_text.strip()
    if "```json" in cleaned:
        cleaned = cleaned.split("```json")[1].split("```")[0].strip()
    elif "```" in cleaned:
        cleaned = cleaned.split("```")[1].strip()

    try:
        return json.loads(cleaned)
    except Exception:
        pass

    match = re.search(r'(\{[\s\S]*\})', cleaned)
    if match:
        try:
            return json.loads(match.group(1))
        except Exception as e:
            logger.warning(f"Fallback regex JSON parse error: {e}")

    return None


def _flatten_comprehensive_schema(parsed: Dict[str, Any]) -> Dict[str, Any]:
    """Maps the rich nested multi-image JSON schema into flat legal metrology fields."""
    po = parsed.get("productOverview") or {}
    pb = parsed.get("pricingAndBatch") or {}
    ni = parsed.get("nutritionalInfoPer100g") or {}
    ia = parsed.get("ingredientsAndAllergens") or {}
    md = parsed.get("manufacturerDetails") or {}

    net_val = None
    net_unit = "g"
    raw_weight = str(pb.get("netWeight") or "")
    m_net = re.search(r'(\d+(?:\.\d+)?)\s*([a-zA-Z]+)', raw_weight)
    if m_net:
        try:
            net_val = float(m_net.group(1))
            net_unit = m_net.group(2).lower()
        except ValueError:
            pass
    elif pb.get("netWeight") and isinstance(pb.get("netWeight"), (int, float)):
        net_val = float(pb["netWeight"])

    mrp_val = None
    raw_mrp = pb.get("mrp")
    if raw_mrp is not None:
        try:
            mrp_val = float(str(raw_mrp).replace("Rs.", "").replace("₹", "").replace(",", "").strip())
        except ValueError:
            pass

    usp_val = None
    raw_usp = str(pb.get("usp") or "")
    m_usp = re.search(r'(\d+(?:\.\d+)?)', raw_usp)
    if m_usp:
        try:
            usp_val = float(m_usp.group(1))
        except ValueError:
            pass

    mfg_month = None
    mfg_year = None
    raw_mfg = str(pb.get("mfgDate") or "")
    parts = re.findall(r'\d+', raw_mfg)
    if len(parts) >= 3:
        try:
            m = int(parts[1])
            if m > 12 and int(parts[0]) <= 12:
                m = int(parts[0])
            mfg_month = m
            raw_y = int(parts[2])
            mfg_year = 2000 + raw_y if raw_y < 100 else raw_y
        except ValueError:
            pass
    elif len(parts) == 2:
        try:
            mfg_month = int(parts[0])
            raw_y = int(parts[1])
            mfg_year = 2000 + raw_y if raw_y < 100 else raw_y
        except ValueError:
            pass

    care_dict = parsed.get("customerCare") if isinstance(parsed.get("customerCare"), dict) else {}
    care_phone = (
        md.get("customerCarePhone")
        or md.get("consumerCarePhone")
        or md.get("customerCare")
        or md.get("phone")
        or md.get("helpline")
        or parsed.get("customerCarePhone")
        or parsed.get("consumerCarePhone")
        or care_dict.get("phone")
    )
    care_email = (
        md.get("customerCareEmail")
        or md.get("consumerCareEmail")
        or md.get("email")
        or parsed.get("customerCareEmail")
        or parsed.get("consumerCareEmail")
        or care_dict.get("email")
    )

    return {
        "productName": po.get("productName") or parsed.get("productName"),
        "brandName": po.get("brandName") or parsed.get("brandName"),
        "variant": po.get("variant"),
        "category": "FOOD_BEVERAGES",
        "packagingGeometry": "RECTANGULAR_BOX",
        "netQuantityValue": net_val,
        "netQuantityUnit": net_unit,
        "mrpValue": mrp_val,
        "declaredUspValue": usp_val,
        "declaredUspUnit": raw_usp if raw_usp else f"per {net_unit}",
        "mfgDate": pb.get("mfgDate"),
        "mfgMonth": mfg_month,
        "mfgYear": mfg_year,
        "expiryDate": pb.get("useByDate"),
        "batchNumber": pb.get("lotOrBatchNo"),
        "barcode": pb.get("barcode"),
        "manufacturerName": md.get("companyName") or md.get("name") or parsed.get("manufacturerName"),
        "manufacturerAddress": md.get("completeAddress") or md.get("address") or parsed.get("manufacturerAddress"),
        "fssaiLicenseNo": md.get("fssaiLicenseNo") or parsed.get("fssaiLicenseNo"),
        "consumerCarePhone": care_phone,
        "consumerCareEmail": care_email,
        "countryOfOrigin": "India",
        "dietaryClassification": po.get("dietaryClassification"),
        "keyClaims": po.get("keyClaims") or [],
        "nutritionalInfoPer100g": ni,
        "ingredientsList": ia.get("ingredientsList"),
        "allergenAdvice": ia.get("allergenAdvice"),
        "manufacturingWarning": ia.get("manufacturingWarning"),
        "comprehensiveDetails": parsed
    }


def _identify_missing_statutory_fields(flattened: Dict[str, Any]) -> List[str]:
    """Identifies which mandatory declarations are missing or null."""
    missing = []
    if not flattened.get("brandName"):
        missing.append("brandName")
    if not flattened.get("productName"):
        missing.append("productName")
    if flattened.get("netQuantityValue") is None or flattened.get("netQuantityValue") <= 0:
        missing.append("netQuantityValue")
    if flattened.get("mrpValue") is None or flattened.get("mrpValue") <= 0:
        missing.append("mrpValue")
    if flattened.get("declaredUspValue") is None or flattened.get("declaredUspValue") <= 0:
        missing.append("declaredUspValue")
    if not flattened.get("mfgDate") and not flattened.get("mfgMonth"):
        missing.append("mfgDate")
    if not flattened.get("manufacturerName"):
        missing.append("manufacturerName")
    if not flattened.get("manufacturerAddress"):
        missing.append("manufacturerAddress")
    if not flattened.get("fssaiLicenseNo"):
        missing.append("fssaiLicenseNo")
    if not flattened.get("consumerCarePhone"):
        missing.append("consumerCarePhone")
    if not flattened.get("consumerCareEmail"):
        missing.append("consumerCareEmail")
    return missing


# ─────────────────────────────────────────────────────────────────────────────
# 3. Resilient Async Model Execution with Tenacity & Exponential Backoff
# ─────────────────────────────────────────────────────────────────────────────

CANDIDATE_MODELS = [
    'models/gemini-3.5-flash',
    'models/gemini-3-flash-preview',
    'models/gemini-3.5-flash-lite',
    'models/gemini-flash-lite-latest',
]


async def _execute_gemini_async_with_retry(
    model: Any,
    content_payload: list,
    timeout_seconds: float = 25.0,
    max_retries: int = 3
) -> Optional[str]:
    """
    Executes Gemini content generation asynchronously with Tenacity / exponential backoff.
    Catches 429 rate limits, 503 service unavailable, timeouts, and network resets.
    """
    if TENACITY_AVAILABLE:
        @retry(
            stop=stop_after_attempt(max_retries),
            wait=wait_exponential(multiplier=1.2, min=1.5, max=6.0),
            retry=retry_if_exception_type((Exception,)),
            reraise=True
        )
        async def _call_tenacity():
            coro = model.generate_content_async(content_payload)
            res = await asyncio.wait_for(coro, timeout=timeout_seconds)
            return res.text if (res and res.text) else ""

        try:
            return await _call_tenacity()
        except Exception as e:
            logger.warning(f"[VLM Tenacity] Retries exhausted for model attempt: {e}")
            return None
    else:
        # Fallback exponential backoff retry loop
        backoff = 1.5
        for attempt in range(1, max_retries + 1):
            try:
                coro = model.generate_content_async(content_payload)
                res = await asyncio.wait_for(coro, timeout=timeout_seconds)
                return res.text if (res and res.text) else ""
            except Exception as e:
                logger.warning(f"[VLM Backoff] Attempt {attempt}/{max_retries} failed: {e}")
                if attempt < max_retries:
                    await asyncio.sleep(backoff)
                    backoff *= 1.5
                else:
                    return None


# ─────────────────────────────────────────────────────────────────────────────
# 4. Asynchronous Multi-Image VLM Extraction Engine
# ─────────────────────────────────────────────────────────────────────────────

async def extract_comprehensive_details(image_bytes_list: List[bytes]) -> Optional[Dict[str, Any]]:
    """
    Asynchronously processes multiple packaging panel images simultaneously in Gemini VLM.
    - Dynamically compresses/resizes all images to <=1MB and <=1280px in parallel threads.
    - Employs non-blocking async/await calls with Tenacity exponential backoff retries.
    - Resolves missing declarations through non-blocking parallel targeted sub-queries.
    - Non-fatal fallback: Never crashes the pipeline if VLM fails; allows OCR to arbitrate.
    """
    if not image_bytes_list:
        logger.warning("[VLM] No image bytes provided to extract_comprehensive_details.")
        return None

    print(f"[VLM Brain] Asynchronously analyzing {len(image_bytes_list)} panel(s)...", flush=True)

    # 1. Resolve and configure API Key
    api_key = _load_gemini_key_from_env() or _API_KEY
    if not api_key:
        logger.warning("[VLM] GEMINI_API_KEY is not set. Skipping VLM (OCR Path B will execute).")
        return None

    try:
        genai.configure(api_key=api_key, transport="rest")
    except Exception as e:
        logger.warning(f"[VLM] Notice on genai configuration: {e}")

    # 2. Asynchronously preprocess all images in parallel (<=1MB, <=1280px)
    preproc_tasks = [
        asyncio.to_thread(preprocess_image_for_vlm, b) for b in image_bytes_list
    ]
    pil_results = await asyncio.gather(*preproc_tasks)
    pil_images: List[Image.Image] = [img for img in pil_results if img is not None]

    if not pil_images:
        print("[VLM WARNING] No valid image panels could be decoded.", flush=True)
        return None

    # 3. PASS 1: Global Multi-Image Contextual Synthesis
    content_payload = [STRICT_MULTI_IMAGE_PROMPT] + pil_images
    flattened: Optional[Dict[str, Any]] = None
    active_model = None

    for model_name in CANDIDATE_MODELS:
        try:
            print(f"[VLM Async] Querying model {model_name}...", flush=True)
            model = genai.GenerativeModel(model_name)
            raw_text = await _execute_gemini_async_with_retry(model, content_payload, timeout_seconds=25.0)

            if not raw_text:
                continue

            parsed_json = _clean_and_parse_json(raw_text)
            if parsed_json and isinstance(parsed_json, dict):
                flattened = _flatten_comprehensive_schema(parsed_json)
                active_model = model
                print(
                    f"[VLM Pass 1 SUCCESS] Model: {model_name} | "
                    f"Product='{flattened.get('productName')}', Brand='{flattened.get('brandName')}', "
                    f"MRP={flattened.get('mrpValue')}, NetQty={flattened.get('netQuantityValue')}{flattened.get('netQuantityUnit')}",
                    flush=True
                )
                break
        except Exception as e:
            logger.warning(f"[VLM Async] Model {model_name} encountered error: {e}")
            continue

    # Non-fatal handling if Pass 1 returned no extraction
    if not flattened:
        print("[VLM NOTE] Pass 1 extraction did not complete across candidate models. Yielding to OCR Path B.", flush=True)
        return None

    # 4. PASS 2: Asynchronous Concurrent Targeted Extraction (for missing declarations)
    missing_fields = _identify_missing_statutory_fields(flattened)
    if not missing_fields:
        print("[VLM SUCCESS] All mandatory statutory declarations extracted completely!", flush=True)
    elif active_model is not None:
        print(f"[VLM Status] Missing declarations on packaging: {missing_fields}. Launching targeted recovery...", flush=True)

        async def _query_pricing_async():
            prompt = """You are an expert Legal Metrology officer inspecting packaging stamps.
Inspect the provided packaging panels (specifically looking for the inkjet box or stamp).
Extract ONLY what is actually printed on this commodity into a JSON object:
{
  "netWeight": "Net quantity with unit (e.g. '100 g', '500 ml')",
  "mrp": "Maximum retail price as numeric float",
  "usp": "Unit sale price string with unit if printed, else null",
  "mfgDate": "Manufacturing date string if printed, else null",
  "useByDate": "Expiry date string if printed, else null",
  "lotOrBatchNo": "Batch or Lot code if printed, else null"
}
Return only JSON."""
            target_imgs = pil_images[-2:] if len(pil_images) >= 2 else pil_images
            raw = await _execute_gemini_async_with_retry(active_model, [prompt] + target_imgs, timeout_seconds=15.0)
            return ("pricing", _clean_and_parse_json(raw or ""))

        async def _query_regulatory_async():
            prompt = """You are a Regulatory Inspector inspecting product regulatory panels.
Extract ONLY what is actually printed on this commodity into a JSON object:
{
  "companyName": "Exact manufacturer, packer, or marketer company name",
  "completeAddress": "Full factory or corporate address with PIN code",
  "fssaiLicenseNo": "14-digit FSSAI number if printed, else null",
  "customerCarePhone": "Helpline phone number if printed, else null",
  "customerCareEmail": "Support email address if printed, else null"
}
Return only JSON."""
            target_imgs = pil_images[1:] if len(pil_images) > 1 else pil_images
            raw = await _execute_gemini_async_with_retry(active_model, [prompt] + target_imgs, timeout_seconds=15.0)
            return ("regulatory", _clean_and_parse_json(raw or ""))

        async def _query_pdp_async():
            prompt = """Extract the exact Brand Name and Product Name from this Front Principal Display Panel (PDP).
Extract ONLY what is actually printed on this commodity:
{
  "brandName": "Brand or company name",
  "productName": "Commercial product name",
  "variant": "Flavor or variant name if any, else null",
  "dietaryClassification": "Vegetarian/Non-Vegetarian/Vegan",
  "keyClaims": []
}
Return only JSON."""
            raw = await _execute_gemini_async_with_retry(active_model, [prompt, pil_images[0]], timeout_seconds=15.0)
            return ("pdp", _clean_and_parse_json(raw or ""))

        pricing_missing = any(f in missing_fields for f in ["mrpValue", "netQuantityValue", "declaredUspValue", "mfgDate"])
        reg_missing = any(f in missing_fields for f in ["manufacturerName", "manufacturerAddress", "fssaiLicenseNo", "consumerCarePhone", "consumerCareEmail"])
        pdp_missing = any(f in missing_fields for f in ["brandName", "productName"])

        targeted_tasks = []
        if pricing_missing: targeted_tasks.append(_query_pricing_async())
        if reg_missing: targeted_tasks.append(_query_regulatory_async())
        if pdp_missing: targeted_tasks.append(_query_pdp_async())

        if targeted_tasks:
            results = await asyncio.gather(*targeted_tasks, return_exceptions=True)
            for res in results:
                if isinstance(res, tuple) and len(res) == 2:
                    category, t_json = res
                    if not t_json:
                        continue

                    if category == "pricing":
                        if not flattened.get("mrpValue") and t_json.get("mrp"):
                            try:
                                flattened["mrpValue"] = float(str(t_json["mrp"]).replace("Rs.", "").replace("₹", "").strip())
                            except ValueError:
                                pass
                        if not flattened.get("netQuantityValue") and t_json.get("netWeight"):
                            m_n = re.search(r'(\d+(?:\.\d+)?)\s*([a-zA-Z]+)', str(t_json["netWeight"]))
                            if m_n:
                                flattened["netQuantityValue"] = float(m_n.group(1))
                                flattened["netQuantityUnit"] = m_n.group(2).lower()
                        if not flattened.get("declaredUspValue") and t_json.get("usp"):
                            m_u = re.search(r'(\d+(?:\.\d+)?)', str(t_json["usp"]))
                            if m_u:
                                flattened["declaredUspValue"] = float(m_u.group(1))
                                flattened["declaredUspUnit"] = str(t_json["usp"])
                        if not flattened.get("mfgDate") and t_json.get("mfgDate"):
                            flattened["mfgDate"] = str(t_json["mfgDate"])
                        if t_json.get("useByDate"):
                            flattened["expiryDate"] = str(t_json["useByDate"])
                        if t_json.get("lotOrBatchNo"):
                            flattened["batchNumber"] = str(t_json["lotOrBatchNo"])

                    elif category == "regulatory":
                        if not flattened.get("manufacturerName") and t_json.get("companyName"):
                            flattened["manufacturerName"] = str(t_json["companyName"]).strip()
                        if not flattened.get("manufacturerAddress") and t_json.get("completeAddress"):
                            flattened["manufacturerAddress"] = str(t_json["completeAddress"]).strip()
                        if not flattened.get("fssaiLicenseNo") and t_json.get("fssaiLicenseNo"):
                            flattened["fssaiLicenseNo"] = str(t_json["fssaiLicenseNo"]).strip()
                        if not flattened.get("consumerCarePhone") and t_json.get("customerCarePhone"):
                            flattened["consumerCarePhone"] = str(t_json["customerCarePhone"]).strip()
                        if not flattened.get("consumerCareEmail") and t_json.get("customerCareEmail"):
                            flattened["consumerCareEmail"] = str(t_json["customerCareEmail"]).strip()

                    elif category == "pdp":
                        if not flattened.get("brandName") and t_json.get("brandName"):
                            flattened["brandName"] = str(t_json["brandName"]).strip()
                        if not flattened.get("productName") and t_json.get("productName"):
                            flattened["productName"] = str(t_json["productName"]).strip()
                        if not flattened.get("variant") and t_json.get("variant"):
                            flattened["variant"] = str(t_json["variant"]).strip()

    # Rule 6(11) USP derivation fallback
    if (flattened.get("declaredUspValue") is None or flattened.get("declaredUspValue") <= 0) and \
       (flattened.get("mrpValue") and flattened.get("netQuantityValue") and flattened.get("netQuantityValue") > 0):
        flattened["declaredUspValue"] = round(flattened["mrpValue"] / flattened["netQuantityValue"], 2)
        flattened["declaredUspUnit"] = f"per {flattened.get('netQuantityUnit', 'g')}"

    # Sync back into comprehensiveDetails
    if "comprehensiveDetails" in flattened and isinstance(flattened["comprehensiveDetails"], dict):
        comp = flattened["comprehensiveDetails"]
        comp.setdefault("productOverview", {})["brandName"] = flattened.get("brandName")
        comp["productOverview"]["productName"] = flattened.get("productName")
        comp["productOverview"]["variant"] = flattened.get("variant")
        comp.setdefault("pricingAndBatch", {})["mrp"] = flattened.get("mrpValue")
        comp["pricingAndBatch"]["netWeight"] = f"{flattened.get('netQuantityValue')} {flattened.get('netQuantityUnit')}"
        comp["pricingAndBatch"]["usp"] = f"Rs. {flattened.get('declaredUspValue')}/{flattened.get('netQuantityUnit')}"
        comp["pricingAndBatch"]["mfgDate"] = flattened.get("mfgDate")
        comp["pricingAndBatch"]["useByDate"] = flattened.get("expiryDate")
        comp["pricingAndBatch"]["lotOrBatchNo"] = flattened.get("batchNumber")
        comp.setdefault("manufacturerDetails", {})["companyName"] = flattened.get("manufacturerName")
        comp["manufacturerDetails"]["completeAddress"] = flattened.get("manufacturerAddress")
        comp["manufacturerDetails"]["fssaiLicenseNo"] = flattened.get("fssaiLicenseNo")
        comp["manufacturerDetails"]["customerCarePhone"] = flattened.get("consumerCarePhone")
        comp["manufacturerDetails"]["customerCareEmail"] = flattened.get("consumerCareEmail")

    print(
        f"[VLM COMPLETE] "
        f"Brand='{flattened.get('brandName')}', Product='{flattened.get('productName')}', "
        f"NetQty={flattened.get('netQuantityValue')}{flattened.get('netQuantityUnit')}, MRP=Rs.{flattened.get('mrpValue')}",
        flush=True
    )
    return flattened


# ─────────────────────────────────────────────────────────────────────────────
# 5. Synchronous Backward-Compatibility Bridges
# ─────────────────────────────────────────────────────────────────────

def extract_comprehensive_details_sync(image_bytes_list: List[bytes]) -> Optional[Dict[str, Any]]:
    """Synchronous bridge for CLI tools and non-async test scripts."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import nest_asyncio
            nest_asyncio.apply()
            return loop.run_until_complete(extract_comprehensive_details(image_bytes_list))
        else:
            return loop.run_until_complete(extract_comprehensive_details(image_bytes_list))
    except Exception:
        return asyncio.run(extract_comprehensive_details(image_bytes_list))


def extract_details_from_all_panels(front_img, back_img, side_img, mrp_img) -> Optional[Dict[str, Any]]:
    """Backwards-compatible multi-angle wrapper."""
    byte_list: List[bytes] = []
    for img in [front_img, back_img, side_img, mrp_img]:
        if img is not None:
            if isinstance(img, bytes):
                byte_list.append(img)
            elif isinstance(img, Image.Image):
                buf = io.BytesIO()
                img.save(buf, format="JPEG")
                byte_list.append(buf.getvalue())
            elif hasattr(img, "read"):
                try:
                    b = img.read()
                    if b:
                        byte_list.append(b)
                except Exception:
                    pass

    return extract_comprehensive_details_sync(byte_list)


def extract_with_vlm_multi_angle(angle_images: Dict[str, bytes]) -> Optional[Dict[str, Any]]:
    """Controller bridge function for split-path execution."""
    byte_list = [b for b in angle_images.values() if b]
    return extract_comprehensive_details_sync(byte_list)


def extract_with_vlm(image_bytes: bytes) -> Optional[Dict[str, Any]]:
    """Single-image backwards compatibility wrapper."""
    return extract_comprehensive_details_sync([image_bytes] if image_bytes else [])
