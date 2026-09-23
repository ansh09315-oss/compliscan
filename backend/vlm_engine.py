"""
Engine 1: The Semantic Brain — Multi-Image Contextual VLM Engine
(backend/vlm_engine.py)

Uses Google Generative AI (gemini-1.5-flash) to process multiple packaging images
(Front, Back, Side, Batch) simultaneously in a single API call.
Stitches fragmented data across panels into a production-ready comprehensive JSON payload.
"""

import os
import io
import re
import json
import logging
import sys
from typing import Dict, Any, Optional, List, Union
from PIL import Image

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

import google.generativeai as genai

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
# 3. The Strict JSON System Prompt (CRITICAL)
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
    """
    Cleans markdown formatting and parses JSON with robust fallback regex.
    """
    if not raw_text:
        return None

    cleaned = raw_text.strip()
    # Strip markdown code fences if present
    if "```json" in cleaned:
        cleaned = cleaned.split("```json")[1].split("```")[0].strip()
    elif "```" in cleaned:
        cleaned = cleaned.split("```")[1].strip()

    # Attempt direct parse
    try:
        return json.loads(cleaned)
    except Exception:
        pass

    # Regex fallback: find outermost matching JSON object
    match = re.search(r'(\{[\s\S]*\})', cleaned)
    if match:
        try:
            return json.loads(match.group(1))
        except Exception as e:
            logger.warning(f"Fallback regex JSON parse error: {e}")

    return None


def _flatten_comprehensive_schema(parsed: Dict[str, Any]) -> Dict[str, Any]:
    """
    Maps the rich nested multi-image JSON schema into flat legal metrology fields
    for Master Brain cross-validation while preserving the full comprehensiveDetails object.
    """
    po = parsed.get("productOverview") or {}
    pb = parsed.get("pricingAndBatch") or {}
    ni = parsed.get("nutritionalInfoPer100g") or {}
    ia = parsed.get("ingredientsAndAllergens") or {}
    md = parsed.get("manufacturerDetails") or {}

    # Extract Net Quantity numeric value & unit from netWeight string (e.g. '450 g', '750 ml')
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

    # Extract MRP numeric float
    mrp_val = None
    raw_mrp = pb.get("mrp")
    if raw_mrp is not None:
        try:
            mrp_val = float(str(raw_mrp).replace("Rs.", "").replace("₹", "").replace(",", "").strip())
        except ValueError:
            pass

    # Extract USP numeric value (e.g. 'Rs. 0.59/g' -> 0.59)
    usp_val = None
    raw_usp = str(pb.get("usp") or "")
    m_usp = re.search(r'(\d+(?:\.\d+)?)', raw_usp)
    if m_usp:
        try:
            usp_val = float(m_usp.group(1))
        except ValueError:
            pass

    # Extract Mfg Month & Year (Handles DD/MM/YY and MM/YYYY)
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

    # Build standardized flat dictionary with comprehensive details attached
    return {
        # Core Legal Metrology Fields
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

        # Manufacturer & FSSAI Details
        "manufacturerName": md.get("companyName") or md.get("name") or parsed.get("manufacturerName"),
        "manufacturerAddress": md.get("completeAddress") or md.get("address") or parsed.get("manufacturerAddress"),
        "fssaiLicenseNo": md.get("fssaiLicenseNo") or parsed.get("fssaiLicenseNo"),
        "consumerCarePhone": care_phone,
        "consumerCareEmail": care_email,
        "countryOfOrigin": "India",

        # Food Safety & Nutritional Attributes
        "dietaryClassification": po.get("dietaryClassification"),
        "keyClaims": po.get("keyClaims") or [],
        "nutritionalInfoPer100g": ni,
        "ingredientsList": ia.get("ingredientsList"),
        "allergenAdvice": ia.get("allergenAdvice"),
        "manufacturingWarning": ia.get("manufacturingWarning"),

        # Full Original Nested Object for UI Rendering
        "comprehensiveDetails": parsed
    }


# ─────────────────────────────────────────────────────────────────────────────
# 2. Advanced Multi-Image VLM Extraction Logic
# ─────────────────────────────────────────────────────────────────────────────

def _identify_missing_statutory_fields(flattened: Dict[str, Any]) -> List[str]:
    """Checks which mandatory statutory declarations are missing or null."""
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


def extract_comprehensive_details(image_bytes_list: List[bytes]) -> Optional[Dict[str, Any]]:
    """
    Processes multiple packaging panel images simultaneously in a single Gemini API call,
    with an intelligent looping mechanism that continues querying panels until all
    mandatory packaging details are fully extracted.
    """
    if not image_bytes_list:
        logger.warning("[VLM] No image bytes provided to extract_comprehensive_details.")
        return None

    print(f"[VLM Brain] Analyzing {len(image_bytes_list)} images simultaneously...")

    # Load and configure API key dynamically with REST transport for Windows stability
    api_key = _load_gemini_key_from_env() or _API_KEY
    if not api_key:
        logger.warning("[VLM] GEMINI_API_KEY is not set.")
        return None

    try:
        genai.configure(api_key=api_key, transport="rest")
    except Exception:
        pass

    # Convert all raw byte buffers into PIL Image objects and optimize dimensions for fast REST transfer
    pil_images: List[Image.Image] = []
    for idx, b in enumerate(image_bytes_list):
        pil_img = _to_pil_image(b)
        if pil_img is not None:
            # Resize large images to max 800x800 for fast REST uploads (Gemini Flash
            # extracts text reliably at this resolution; cuts payload ~60% vs 1280px)
            if pil_img.width > 800 or pil_img.height > 800:
                pil_img = pil_img.copy()
                pil_img.thumbnail((800, 800), Image.Resampling.LANCZOS)
            pil_images.append(pil_img)
        else:
            logger.warning(f"[VLM] Image buffer #{idx+1} could not be converted to PIL.")

    if not pil_images:
        print("[VLM ERROR] No valid image panels could be parsed.", flush=True)
        return None

    candidate_models = [
        'models/gemini-3.5-flash-lite',
        'models/gemini-3.6-flash',
        'models/gemini-3.5-flash',
        'models/gemini-flash-lite-latest',
    ]

    # ── PASS 1: Global Multi-Image Contextual Synthesis ────────────────────────
    content_payload = [STRICT_MULTI_IMAGE_PROMPT] + pil_images
    flattened: Optional[Dict[str, Any]] = None
    active_model = None

    for model_name in candidate_models:
        try:
            print(f"[VLM] Trying model {model_name}...", flush=True)
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(content_payload)
            raw_text = response.text if (response and response.text) else ""

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
            print(f"[VLM] Model {model_name} error: {e}", flush=True)
            continue

    if not flattened:
        print("[VLM ERROR] Pass 1 Extraction Error across candidate models.", flush=True)
        return None

    # ── PASS 2: Targeted Extraction (Single pass if critical pricing is missing) ─────────────
    missing_fields = _identify_missing_statutory_fields(flattened)
    if not missing_fields:
        print("[VLM SUCCESS] All mandatory statutory declarations extracted successfully!", flush=True)
    else:
        print(f"[VLM Status] Missing declarations on packaging: {missing_fields}", flush=True)

        # ── PARALLEL targeted extraction for all missing field categories ──────
        from concurrent.futures import ThreadPoolExecutor, as_completed

        def _query_pricing(model, imgs, flat):
            """Sub-loop A: Missing pricing / batch / dates"""
            targeted_prompt = """You are an expert Legal Metrology officer inspecting the packaging stamps.
Inspect the provided packaging panels (specifically looking for the white inkjet box or stamp).
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
            try:
                target_imgs = imgs[-2:] if len(imgs) >= 2 else imgs
                res = model.generate_content([targeted_prompt] + target_imgs)
                t_json = _clean_and_parse_json(res.text if res else "")
                return ("pricing", t_json)
            except Exception as e:
                logger.warning(f"[VLM Parallel] Pricing query error: {e}")
                return ("pricing", None)

        def _query_regulatory(model, imgs, flat):
            """Sub-loop B: Missing manufacturer / FSSAI / consumer care"""
            targeted_reg_prompt = """You are a Regulatory Inspector inspecting product regulatory panels.
Extract ONLY what is actually printed on this commodity into a JSON object:
{
  "companyName": "Exact manufacturer, packer, or marketer company name",
  "completeAddress": "Full factory or corporate address with PIN code",
  "fssaiLicenseNo": "14-digit FSSAI number if printed, else null",
  "customerCarePhone": "Helpline phone number if printed, else null",
  "customerCareEmail": "Support email address if printed, else null"
}
Return only JSON."""
            try:
                target_imgs = imgs[1:] if len(imgs) > 1 else imgs
                res = model.generate_content([targeted_reg_prompt] + target_imgs)
                t_json = _clean_and_parse_json(res.text if res else "")
                return ("regulatory", t_json)
            except Exception as e:
                logger.warning(f"[VLM Parallel] Regulatory query error: {e}")
                return ("regulatory", None)

        def _query_pdp(model, imgs, flat):
            """Sub-loop C: Missing Brand / Product Name"""
            targeted_pdp_prompt = """Extract the exact Brand Name and Product Name from this Front Principal Display Panel (PDP).
Extract ONLY what is actually printed on this commodity:
{
  "brandName": "Brand or company name",
  "productName": "Commercial product name",
  "variant": "Flavor or variant name if any, else null",
  "dietaryClassification": "Vegetarian/Non-Vegetarian/Vegan",
  "keyClaims": []
}
Return only JSON."""
            try:
                front_img = [imgs[0]]
                res = model.generate_content([targeted_pdp_prompt] + front_img)
                t_json = _clean_and_parse_json(res.text if res else "")
                return ("pdp", t_json)
            except Exception as e:
                logger.warning(f"[VLM Parallel] PDP query error: {e}")
                return ("pdp", None)

        pricing_missing = any(f in missing_fields for f in ["mrpValue", "netQuantityValue", "declaredUspValue", "mfgDate"])
        reg_missing = any(f in missing_fields for f in ["manufacturerName", "manufacturerAddress", "fssaiLicenseNo", "consumerCarePhone", "consumerCareEmail"])
        pdp_missing = any(f in missing_fields for f in ["brandName", "productName"])

        futures = []
        with ThreadPoolExecutor(max_workers=3) as executor:
            if pricing_missing and active_model:
                futures.append(executor.submit(_query_pricing, active_model, pil_images, flattened))
            if reg_missing and active_model:
                futures.append(executor.submit(_query_regulatory, active_model, pil_images, flattened))
            if pdp_missing and active_model:
                futures.append(executor.submit(_query_pdp, active_model, pil_images, flattened))

            for future in as_completed(futures):
                try:
                    category, t_json = future.result(timeout=120)
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
                            d_parts = re.findall(r'\d+', str(t_json["mfgDate"]))
                            if len(d_parts) >= 3:
                                m = int(d_parts[1])
                                if m > 12 and int(d_parts[0]) <= 12:
                                    m = int(d_parts[0])
                                flattened["mfgMonth"] = m
                                y = int(d_parts[2])
                                flattened["mfgYear"] = 2000 + y if y < 100 else y
                            elif len(d_parts) == 2:
                                flattened["mfgMonth"] = int(d_parts[0])
                                y = int(d_parts[1])
                                flattened["mfgYear"] = 2000 + y if y < 100 else y
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

                except Exception as e:
                    logger.warning(f"[VLM Parallel] Future result error: {e}")

    # Fallback derivation for Unit Sale Price if Net Qty and MRP exist but USP wasn't declared
    if (flattened.get("declaredUspValue") is None or flattened.get("declaredUspValue") <= 0) and \
       (flattened.get("mrpValue") and flattened.get("netQuantityValue") and flattened.get("netQuantityValue") > 0):
        calc_usp = round(flattened["mrpValue"] / flattened["netQuantityValue"], 2)
        flattened["declaredUspValue"] = calc_usp
        flattened["declaredUspUnit"] = f"per {flattened.get('netQuantityUnit', 'g')}"

    # Sync back into comprehensiveDetails object
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
        f"NetQty={flattened.get('netQuantityValue')}{flattened.get('netQuantityUnit')}, MRP=Rs.{flattened.get('mrpValue')}, "
        f"USP={flattened.get('declaredUspValue')}, FSSAI={flattened.get('fssaiLicenseNo')}, "
        f"Mfg='{flattened.get('manufacturerName')}', Address='{flattened.get('manufacturerAddress')}'"
    )

    return flattened


def extract_details_from_all_panels(front_img, back_img, side_img, mrp_img) -> Optional[Dict[str, Any]]:
    """
    Backwards-compatible multi-angle wrapper: passes all available panel byte buffers
    to extract_comprehensive_details.
    """
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

    return extract_comprehensive_details(byte_list)


def extract_with_vlm_multi_angle(angle_images: Dict[str, bytes]) -> Optional[Dict[str, Any]]:
    """
    Controller bridge function for split-path execution.
    Passes list of angle image buffers to extract_comprehensive_details.
    """
    byte_list = [b for b in angle_images.values() if b]
    return extract_comprehensive_details(byte_list)


def extract_with_vlm(image_bytes: bytes) -> Optional[Dict[str, Any]]:
    """Single-image backwards compatibility wrapper."""
    return extract_comprehensive_details([image_bytes] if image_bytes else [])
