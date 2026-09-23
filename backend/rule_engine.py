"""
Universal Legal Metrology Compliance Engine (backend/rule_engine.py)
Implements statutory checks under Legal Metrology (Packaged Commodities) Rules, 2011 & 2026 amendments:
- Rule 7: Principal Display Panel (PDP) area calculation & Minimum Font Height matrix
- Rule 6(11): Dynamic Unit Sale Price (USP) validation for liquids, solids, and unit items
- Rule 6(1)(a) & 6(2): Mandatory Manufacturer/Packer identity, address with PIN code, and Consumer Care contacts
- Rule 6(1)(d): Month and Year of Manufacture or Pre-packing
"""

import re
from typing import Dict, Any, List


def calculate_pdp_area(
    geometry: str,
    height_mm: float,
    width_mm: float = None,
    circumference_mm: float = None
) -> float:
    """
    Calculates the Principal Display Panel (PDP) area under Rule 7:
    - Cylindrical bottle/can: 40% of Height x Circumference
    - Rectangular container/carton: Height x Width
    - Flexible pouch: Height x Width
    """
    if geometry in ["CYLINDRICAL_BOTTLE", "CYLINDRICAL_CONTAINER"] and circumference_mm:
        area_cm2 = 0.40 * (height_mm / 10.0) * (circumference_mm / 10.0)
    elif width_mm:
        area_cm2 = (height_mm / 10.0) * (width_mm / 10.0)
    else:
        # Standard packaging aspect ratio approximation
        area_cm2 = (height_mm / 10.0) * ((height_mm * 0.45) / 10.0)
    return round(float(area_cm2), 2)


def evaluate_legal_metrology(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Performs deterministic legal metrology rule evaluation on extracted packaging declarations.
    Produces comprehensive violation records and ruleResults checklist for compliance gauges.
    """
    violations: List[Dict[str, Any]] = []
    rule_results: List[Dict[str, Any]] = []

    # ─────────────────────────────────────────────────────────────────────────
    # 1. Rule 7: Principal Display Panel Area vs Minimum Font Height
    # ─────────────────────────────────────────────────────────────────────────
    geometry = data.get("packagingGeometry", "RECTANGULAR_BOX")
    height_mm = float(data.get("containerHeightMm", 100.0) or 100.0)
    width_mm = float(data.get("containerWidthMm", 0.0) or 0.0) if data.get("containerWidthMm") else None
    circumference_mm = float(data.get("circumferenceMm", 0.0) or 0.0) if data.get("circumferenceMm") else None

    pdp_area = calculate_pdp_area(geometry, height_mm, width_mm, circumference_mm)

    if pdp_area <= 50.0:
        min_font = 1.0
    elif 50.0 < pdp_area <= 100.0:
        min_font = 1.5
    elif 100.0 < pdp_area <= 500.0:
        min_font = 2.5
    elif 500.0 < pdp_area <= 2500.0:
        min_font = 4.0
    else:
        min_font = 6.0

    detected_font = float(data.get("detectedNumeralHeightMm", 2.5) or 2.5)
    font_passed = detected_font >= min_font

    if not font_passed:
        violations.append({
            "ruleCode": "RULE_7",
            "statutoryRuleRef": "Rule 7 & 8, Legal Metrology (Packaged Commodities) Rules 2011",
            "statutoryCitation": "Rule 7 & 8, Legal Metrology (Packaged Commodities) Rules 2011",
            "severity": "MEDIUM",
            "title": "Font Size Non-Compliance",
            "violationTitle": "Font Size Non-Compliance",
            "defect": f"For PDP surface area of {pdp_area} cm², minimum font height required is {min_font} mm.",
            "defectDescription": f"For PDP surface area of {pdp_area} cm², minimum font height required is {min_font} mm.",
            "detected": f"{detected_font} mm",
            "detectedValue": f"{detected_font} mm",
            "expected": f">= {min_font} mm",
            "requiredValue": f">= {min_font} mm"
        })

    rule_results.append({
        "ruleId": "RULE_7",
        "ruleLabel": "Rule 7 — Minimum Numeral & Font Height",
        "passed": font_passed,
        "details": f"PDP: {pdp_area} cm² | Detected: {detected_font} mm | Required: {min_font} mm",
        "severity": "MEDIUM"
    })

    # ─────────────────────────────────────────────────────────────────────────
    # 2. Rule 6(11): Dynamic Unit Sale Price (USP) Mathematical Enforcement
    # ─────────────────────────────────────────────────────────────────────────
    mrp = float(data.get("mrpValue", 0.0) or 0.0)
    qty = float(data.get("netQuantityValue", 0.0) or 0.0)
    unit = str(data.get("netQuantityUnit", "") or "").lower().strip()
    declared_usp = data.get("declaredUspValue")
    declared_usp_unit = str(data.get("declaredUspUnit", "") or "").lower().strip()

    expected_usp_unit = None
    expected_usp_val = None

    if qty > 0 and mrp > 0:
        # Liquids
        if unit in ["ml", "milliliter", "millilitre"]:
            if qty < 1000:
                expected_usp_unit = "per ml"
                expected_usp_val = round(mrp / qty, 2)
            else:
                expected_usp_unit = "per l"
                expected_usp_val = round(mrp / (qty / 1000.0), 2)
        elif unit in ["l", "liter", "litre"]:
            expected_usp_unit = "per l"
            expected_usp_val = round(mrp / qty, 2)

        # Solids
        elif unit in ["g", "gram", "grams", "gm"]:
            if qty < 1000:
                expected_usp_unit = "per g"
                expected_usp_val = round(mrp / qty, 2)
            else:
                expected_usp_unit = "per kg"
                expected_usp_val = round(mrp / (qty / 1000.0), 2)
        elif unit in ["kg", "kilogram", "kilograms"]:
            expected_usp_unit = "per kg"
            expected_usp_val = round(mrp / qty, 2)

        # Unit counts
        elif unit in ["piece", "pieces", "number", "numbers", "n", "u"]:
            expected_usp_unit = "per piece"
            expected_usp_val = round(mrp / qty, 2)

    usp_passed = True
    usp_defect = ""
    if expected_usp_unit and expected_usp_val is not None:
        if declared_usp is None or float(declared_usp or 0) == 0.0:
            usp_passed = False
            usp_defect = f"Product lacks mandatory Unit Sale Price declaration for retail sale."
            violations.append({
                "ruleCode": "RULE_6_11",
                "statutoryRuleRef": "Rule 6(11), Legal Metrology (Packaged Commodities) Amendment Rules 2021",
                "statutoryCitation": "Rule 6(11), Legal Metrology (Packaged Commodities) Amendment Rules 2021",
                "severity": "HIGH",
                "title": "Missing Unit Sale Price (USP)",
                "violationTitle": "Missing Unit Sale Price (USP)",
                "defect": usp_defect,
                "defectDescription": usp_defect,
                "detected": "Not Declared",
                "detectedValue": "Not Declared",
                "expected": f"₹ {expected_usp_val} {expected_usp_unit}",
                "requiredValue": f"₹ {expected_usp_val} {expected_usp_unit}"
            })
        else:
            base_unit = expected_usp_unit.replace("per ", "").strip()
            declared_clean = str(declared_usp_unit or "").lower().replace(" ", "")
            unit_valid = (
                expected_usp_unit in str(declared_usp_unit or "").lower()
                or f"/{base_unit}" in declared_clean
                or f"per{base_unit}" in declared_clean
                or base_unit in declared_clean
            )
            if not unit_valid:
                usp_passed = False
                usp_defect = f"Mandatory unit format required: '{expected_usp_unit}'"
                violations.append({
                    "ruleCode": "RULE_6_11",
                    "statutoryRuleRef": "Rule 6(11), Standard Metric Units for USP",
                    "statutoryCitation": "Rule 6(11), Standard Metric Units for USP",
                    "severity": "MEDIUM",
                    "title": "Incorrect USP Metric Unit",
                    "violationTitle": "Incorrect USP Metric Unit",
                    "defect": usp_defect,
                    "defectDescription": usp_defect,
                    "detected": declared_usp_unit or "None",
                    "detectedValue": declared_usp_unit or "None",
                    "expected": expected_usp_unit,
                    "requiredValue": expected_usp_unit
                })
            elif abs(float(declared_usp) - expected_usp_val) > 0.05:
                usp_passed = False
                usp_defect = f"Declared USP does not align with retail MRP / Net Qty calculation."
                violations.append({
                    "ruleCode": "RULE_6_11",
                    "statutoryRuleRef": "Rule 6(11), Mathematical Precision of Price Declaration",
                    "statutoryCitation": "Rule 6(11), Mathematical Precision of Price Declaration",
                    "severity": "HIGH",
                    "title": "USP Mathematical Discrepancy",
                    "violationTitle": "USP Mathematical Discrepancy",
                    "defect": usp_defect,
                    "defectDescription": usp_defect,
                    "detected": f"₹ {declared_usp}",
                    "detectedValue": f"₹ {declared_usp}",
                    "expected": f"₹ {expected_usp_val}",
                    "requiredValue": f"₹ {expected_usp_val}"
                })

    rule_results.append({
        "ruleId": "RULE_6_11",
        "ruleLabel": "Rule 6(11) — Unit Sale Price (USP) Metric Compliance",
        "passed": usp_passed,
        "details": f"Declared: ₹{declared_usp or 'None'} {declared_usp_unit} | Expected: ₹{expected_usp_val} {expected_usp_unit}" if expected_usp_val else "USP declaration verified.",
        "severity": "HIGH"
    })

    # ─────────────────────────────────────────────────────────────────────────
    # 3. Rule 6(1)(a): Manufacturer Legal Identity & Complete Address
    # ─────────────────────────────────────────────────────────────────────────
    mfg_name = data.get("manufacturerName")
    mfg_addr = data.get("manufacturerAddress")
    mfg_passed = bool(mfg_name and mfg_addr and len(str(mfg_addr).strip()) >= 10)

    if not mfg_passed:
        violations.append({
            "ruleCode": "RULE_6_1_A",
            "statutoryRuleRef": "Rule 6(1)(a), Name & Complete Address of Manufacturer/Packer",
            "statutoryCitation": "Rule 6(1)(a), Name & Complete Address of Manufacturer/Packer",
            "severity": "HIGH",
            "title": "Incomplete Manufacturer Declaration",
            "violationTitle": "Incomplete Manufacturer Declaration",
            "defect": "Complete legal corporate entity name and postal address with city, state & 6-digit PIN code is mandatory.",
            "defectDescription": "Complete legal corporate entity name and postal address with city, state & 6-digit PIN code is mandatory.",
            "detected": str(mfg_name or "Missing") + " | " + str(mfg_addr or "Missing"),
            "detectedValue": str(mfg_name or "Missing") + " | " + str(mfg_addr or "Missing"),
            "expected": "Company Name + Street/Estate + City + State + PIN Code",
            "requiredValue": "Company Name + Street/Estate + City + State + PIN Code"
        })

    rule_results.append({
        "ruleId": "RULE_6_1_A",
        "ruleLabel": "Rule 6(1)(a) — Manufacturer Identity & Address",
        "passed": mfg_passed,
        "details": f"Manufacturer: {mfg_name or 'Missing'} | Address: {mfg_addr or 'Missing'}",
        "severity": "HIGH"
    })

    # ─────────────────────────────────────────────────────────────────────────
    # 4. Rule 6(2): Consumer Care Redressal Mechanism Check
    # ─────────────────────────────────────────────────────────────────────────
    phone = str(data.get("consumerCarePhone") or "").strip()
    email = str(data.get("consumerCareEmail") or "").strip()

    # Fallback to comprehensiveDetails / manufacturerDetails / aliases if empty or placeholder
    def _is_empty(val: str) -> bool:
        return not val or val.lower() in ["none", "null", "n/a", "missing", "—", "-", "undefined"]

    if _is_empty(phone) or _is_empty(email):
        comp = data.get("comprehensiveDetails") or {}
        if isinstance(comp, dict):
            md = comp.get("manufacturerDetails") or {}
            if isinstance(md, dict):
                if _is_empty(phone):
                    phone = str(md.get("customerCarePhone") or md.get("consumerCarePhone") or md.get("customerCare") or md.get("phone") or "").strip()
                if _is_empty(email):
                    email = str(md.get("customerCareEmail") or md.get("consumerCareEmail") or md.get("email") or "").strip()
            if _is_empty(phone) and comp.get("customerCarePhone"):
                phone = str(comp["customerCarePhone"]).strip()
            if _is_empty(email) and comp.get("customerCareEmail"):
                email = str(comp["customerCareEmail"]).strip()

        md_direct = data.get("manufacturerDetails") or {}
        if isinstance(md_direct, dict):
            if _is_empty(phone):
                phone = str(md_direct.get("customerCarePhone") or md_direct.get("consumerCarePhone") or md_direct.get("customerCare") or md_direct.get("phone") or "").strip()
            if _is_empty(email):
                email = str(md_direct.get("customerCareEmail") or md_direct.get("consumerCareEmail") or md_direct.get("email") or "").strip()

    # Search for email anywhere across phone OR email strings
    has_email = False
    combined_contacts = f"{phone} {email}"
    email_match = re.search(r'[a-zA-Z0-9_.+\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9.\-]+', combined_contacts)
    if email_match:
        has_email = True
        if _is_empty(email):
            email = email_match.group(0).rstrip(".,;:")

    # ── Phone Validation ──
    # Search for the FIRST valid phone pattern inside phone OR email string
    has_phone = False
    phone_clean = re.sub(r'[(),\/]', ' ', combined_contacts)

    toll_match = re.search(r'(?:1800|1860)[\s\-]?\d{3,4}[\s\-]?\d{3,4}', phone_clean)
    mobile_match = re.search(r'(?:\+91[\s\-]?|91[\s\-]?|0)?[6-9]\d{1,4}[\s\-]?\d{4,8}', phone_clean)
    landline_match = re.search(r'(?:\+91[\s\-]?|91[\s\-]?|0)?[1-9]\d{1,4}[\s\-]?\d{4,8}', phone_clean)

    if toll_match:
        has_phone = True
    elif mobile_match:
        digits = re.sub(r'[^\d]', '', mobile_match.group(0))
        if 10 <= len(digits) <= 13:
            has_phone = True
    elif landline_match:
        digits = re.sub(r'[^\d]', '', landline_match.group(0))
        if 8 <= len(digits) <= 13:
            has_phone = True
    else:
        fallback_candidates = re.findall(r'\b\d{8,12}\b', phone_clean)
        if fallback_candidates:
            has_phone = True

    care_passed = bool(has_phone and has_email)

    if not care_passed:
        missing_parts = []
        if not has_phone:
            missing_parts.append("Phone")
        if not has_email:
            missing_parts.append("Email")
        violations.append({
            "ruleCode": "RULE_6_2",
            "statutoryRuleRef": "Rule 6(2), Consumer Grievance Redressal Mechanism",
            "statutoryCitation": "Rule 6(2), Consumer Grievance Redressal Mechanism",
            "severity": "HIGH",
            "title": "Deficient Consumer Care Details",
            "violationTitle": "Deficient Consumer Care Details",
            "defect": f"Valid {' and '.join(missing_parts).lower()} must be legibly printed on the package.",
            "defectDescription": f"Valid {' and '.join(missing_parts).lower()} must be legibly printed on the package.",
            "detected": f"Phone: {phone or 'Missing'} | Email: {email or 'Missing'}",
            "detectedValue": f"Phone: {phone or 'Missing'} | Email: {email or 'Missing'}",
            "expected": "Helpline Number AND Official Support Email",
            "requiredValue": "Helpline Number AND Official Support Email"
        })

    rule_results.append({
        "ruleId": "RULE_6_2",
        "ruleLabel": "Rule 6(2) — Consumer Care Redressal Mechanism",
        "passed": care_passed,
        "details": f"Phone: {phone or 'Missing'} (Valid: {has_phone}) | Email: {email or 'Missing'} (Valid: {has_email})",
        "severity": "HIGH"
    })

    # ─────────────────────────────────────────────────────────────────────────
    # 5. Rule 6(1)(d): Month & Year of Manufacture/Packing
    # ─────────────────────────────────────────────────────────────────────────
    mfg_month = data.get("mfgMonth")
    mfg_year = data.get("mfgYear")
    date_passed = bool(mfg_month and mfg_year)

    if not date_passed:
        violations.append({
            "ruleCode": "RULE_6_1_D",
            "statutoryRuleRef": "Rule 6(1)(d), Month and Year of Manufacture or Pre-packing",
            "statutoryCitation": "Rule 6(1)(d), Month and Year of Manufacture or Pre-packing",
            "severity": "MEDIUM",
            "title": "Missing Packing Date",
            "violationTitle": "Missing Packing Date",
            "defect": "Month and Year of manufacture or packing must be clearly declared on package.",
            "defectDescription": "Month and Year of manufacture or packing must be clearly declared on package.",
            "detected": f"Month: {mfg_month or 'Missing'}, Year: {mfg_year or 'Missing'}",
            "detectedValue": f"Month: {mfg_month or 'Missing'}, Year: {mfg_year or 'Missing'}",
            "expected": "MM/YYYY format",
            "requiredValue": "MM/YYYY format"
        })

    rule_results.append({
        "ruleId": "RULE_6_1_D",
        "ruleLabel": "Rule 6(1)(d) — Date of Manufacture / Pre-packing",
        "passed": date_passed,
        "details": f"Date declared: {mfg_month:02d}/{mfg_year}" if date_passed else "Packing date missing or illegible",
        "severity": "MEDIUM"
    })

    # ─────────────────────────────────────────────────────────────────────────
    # 6. Overall Compliance Score Computation
    # ─────────────────────────────────────────────────────────────────────────
    total_statutory_checks = float(len(rule_results))
    passed_count = sum(1 for r in rule_results if r["passed"])
    score = round((passed_count / total_statutory_checks) * 100.0)

    if score == 100:
        verdict = "COMPLIANT"
    elif score >= 60:
        verdict = "PARTIALLY_COMPLIANT"
    else:
        verdict = "NON_COMPLIANT"

    return {
        "complianceScore": score,
        "verdict": verdict,
        "pdpAreaCm2": pdp_area,
        "violations": violations,
        "ruleResults": rule_results,
        "statutoryChecksCount": int(total_statutory_checks),
        "violationsCount": len(violations)
    }
