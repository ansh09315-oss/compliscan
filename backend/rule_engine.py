"""
Universal Legal Metrology Compliance Engine (backend/rule_engine.py)
Implements statutory checks under Legal Metrology (Packaged Commodities) Rules, 2011 & 2026 amendments:
- Rule 7: Principal Display Panel (PDP) area calculation & Minimum Font Height matrix
- Rule 6(11): Dynamic Unit Sale Price (USP) validation for liquids, solids, and unit items
- Rule 6(1)(a) & 6(2): Mandatory Manufacturer/Packer identity, address with PIN code, and Consumer Care contacts
"""

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
        # Fallback approximation based on standard packaging proportion
        area_cm2 = (height_mm / 10.0) * ((height_mm * 0.45) / 10.0)
    return round(float(area_cm2), 2)


def evaluate_legal_metrology(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Performs deterministic legal metrology rule evaluation on extracted packaging declarations.
    """
    violations: List[Dict[str, Any]] = []

    # 1. Rule 7: Principal Display Panel Area vs Minimum Font Height
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

    detected_font = float(data.get("detectedNumeralHeightMm", 2.0) or 2.0)
    if detected_font < min_font:
        violations.append({
            "ruleCode": "RULE_7",
            "statutoryCitation": "Rule 7 & 8, Legal Metrology (Packaged Commodities) Rules 2011",
            "severity": "MEDIUM",
            "title": "Font Size Non-Compliance",
            "defect": f"For PDP surface area of {pdp_area} cm², minimum font height required is {min_font} mm.",
            "detected": f"{detected_font} mm",
            "expected": f">= {min_font} mm"
        })

    # 2. Rule 6(11): Dynamic Unit Sale Price (USP) Mathematical Enforcement
    mrp = float(data.get("mrpValue", 0.0) or 0.0)
    qty = float(data.get("netQuantityValue", 0.0) or 0.0)
    unit = str(data.get("netQuantityUnit", "") or "").lower().strip()
    declared_usp = data.get("declaredUspValue")
    declared_usp_unit = str(data.get("declaredUspUnit", "") or "").lower().strip()

    expected_usp_unit = None
    expected_usp_val = None

    if qty > 0 and mrp > 0:
        # Liquids (Beverages, Sprite, Milk, Juices, Edible Oil, Sanitizers)
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

        # Solids (Biscuits, Flour, Salt, Snacks, Detergents)
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

        # Count items (Soap bars, Eggs, Pens, Unit packs)
        elif unit in ["piece", "pieces", "number", "numbers", "n", "u"]:
            expected_usp_unit = "per piece"
            expected_usp_val = round(mrp / qty, 2)

    if expected_usp_unit and expected_usp_val is not None:
        if declared_usp is None or float(declared_usp or 0) == 0.0:
            violations.append({
                "ruleCode": "RULE_6_11",
                "statutoryCitation": "Rule 6(11), Legal Metrology (Packaged Commodities) Amendment Rules 2021",
                "severity": "HIGH",
                "title": "Missing Unit Sale Price (USP)",
                "defect": f"Product lacks mandatory Unit Sale Price declaration for retail sale.",
                "detected": "Not Declared",
                "expected": f"₹ {expected_usp_val} {expected_usp_unit}"
            })
        else:
            if expected_usp_unit not in declared_usp_unit:
                violations.append({
                    "ruleCode": "RULE_6_11",
                    "statutoryCitation": "Rule 6(11), Standard Metric Units for USP",
                    "severity": "MEDIUM",
                    "title": "Incorrect USP Metric Unit",
                    "defect": f"Mandatory unit format required: '{expected_usp_unit}'",
                    "detected": declared_usp_unit or "None",
                    "expected": expected_usp_unit
                })
            if abs(float(declared_usp) - expected_usp_val) > 0.05:
                violations.append({
                    "ruleCode": "RULE_6_11",
                    "statutoryCitation": "Rule 6(11), Mathematical Precision of Price Declaration",
                    "severity": "HIGH",
                    "title": "USP Mathematical Discrepancy",
                    "defect": f"Declared USP does not align with retail MRP / Net Qty calculation.",
                    "detected": f"₹ {declared_usp}",
                    "expected": f"₹ {expected_usp_val}"
                })

    # 3. Rule 6(1)(a): Manufacturer Legal Identity & Address Completeness
    mfg_name = data.get("manufacturerName")
    mfg_addr = data.get("manufacturerAddress")
    if not mfg_name or not mfg_addr or len(str(mfg_addr).strip()) < 10:
        violations.append({
            "ruleCode": "RULE_6_1_A",
            "statutoryCitation": "Rule 6(1)(a), Name & Complete Address of Manufacturer/Packer/Importer",
            "severity": "HIGH",
            "title": "Incomplete Manufacturer Declaration",
            "defect": "Complete legal corporate entity name and postal address with city, state & 6-digit PIN code is mandatory.",
            "detected": str(mfg_name or "Missing") + " | " + str(mfg_addr or "Missing"),
            "expected": "Company Name + Street/Estate + City + State + PIN Code"
        })

    # 4. Rule 6(2): Consumer Care Redressal Mechanism Check
    phone = data.get("consumerCarePhone")
    email = data.get("consumerCareEmail")
    if not phone or not email:
        violations.append({
            "ruleCode": "RULE_6_2",
            "statutoryCitation": "Rule 6(2), Consumer Grievance Redressal Mechanism",
            "severity": "HIGH",
            "title": "Deficient Consumer Care Details",
            "defect": "Valid telephone helpline number AND consumer grievance email address must be legibly printed.",
            "detected": f"Phone: {phone or 'Missing'} | Email: {email or 'Missing'}",
            "expected": "Helpline Number AND Official Support Email"
        })

    # 5. Rule 6(1)(d): Month & Year of Manufacture/Packing
    mfg_month = data.get("mfgMonth")
    mfg_year = data.get("mfgYear")
    if not mfg_month or not mfg_year:
        violations.append({
            "ruleCode": "RULE_6_1_D",
            "statutoryCitation": "Rule 6(1)(d), Month and Year of Manufacture or Pre-packing",
            "severity": "MEDIUM",
            "title": "Missing Packing Date",
            "defect": "Month and Year of manufacture or packing must be clearly declared on package.",
            "detected": f"Month: {mfg_month or 'Missing'}, Year: {mfg_year or 'Missing'}",
            "expected": "MM/YYYY format"
        })

    # 6. Overall Compliance Score Computation
    total_statutory_checks = 6.0
    passed = max(0.0, total_statutory_checks - len(violations))
    score = round((passed / total_statutory_checks) * 100.0)
    
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
        "statutoryChecksCount": int(total_statutory_checks),
        "violationsCount": len(violations)
    }
