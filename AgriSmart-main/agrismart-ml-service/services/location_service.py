"""
Location & Agro-Climatic Crop Prevalence Scoring Service.

Provides regional crop prevalence weights for major districts in Tamil Nadu and Indian agricultural zones.
Used to refine Random Forest ML model predictions so recommendations reflect both environmental suitability
and real-world local farming practices.
"""

from typing import Dict, Tuple

DISTRICT_CROP_PREVALENCE: Dict[str, Dict[str, float]] = {
    "coimbatore": {
        "rice": 0.95,
        "cotton": 0.94,
        "maize": 0.92,
        "ground nut": 0.90,
        "sugarcane": 0.88,
        "coconut": 0.85,
        "banana": 0.78,
        "mung bean": 0.76,
        "black gram": 0.76,
        "mango": 0.50,
        "tea": 0.35,
        "rubber": 0.15,
        "moth beans": 0.10
    },
    "tiruppur": {
        "cotton": 0.96,
        "maize": 0.92,
        "ground nut": 0.90,
        "rice": 0.88,
        "sugarcane": 0.84,
        "coconut": 0.82,
        "black gram": 0.78,
        "mung bean": 0.75
    },
    "erode": {
        "sugarcane": 0.96,
        "maize": 0.92,
        "rice": 0.90,
        "ground nut": 0.88,
        "cotton": 0.85,
        "coconut": 0.82,
        "banana": 0.80,
        "black gram": 0.75
    },
    "salem": {
        "sugarcane": 0.95,
        "maize": 0.92,
        "ground nut": 0.90,
        "rice": 0.88,
        "cotton": 0.84,
        "mango": 0.78,
        "coffee": 0.40
    },
    "madurai": {
        "rice": 0.96,
        "cotton": 0.92,
        "ground nut": 0.90,
        "sugarcane": 0.88,
        "maize": 0.85,
        "mung bean": 0.82,
        "banana": 0.78,
        "coconut": 0.75
    },
    "thanjavur": {
        "rice": 0.98,
        "sugarcane": 0.92,
        "coconut": 0.88,
        "black gram": 0.85,
        "mung bean": 0.85,
        "ground nut": 0.78,
        "banana": 0.75
    },
    "trichy": {
        "rice": 0.96,
        "sugarcane": 0.92,
        "banana": 0.90,
        "cotton": 0.84,
        "maize": 0.82,
        "ground nut": 0.78
    },
    "tiruchirappalli": {
        "rice": 0.96,
        "sugarcane": 0.92,
        "banana": 0.90,
        "cotton": 0.84,
        "maize": 0.82,
        "ground nut": 0.78
    },
    "dindigul": {
        "maize": 0.94,
        "cotton": 0.90,
        "ground nut": 0.88,
        "rice": 0.86,
        "banana": 0.82,
        "sugarcane": 0.78
    },
    "nilgiris": {
        "tea": 0.98,
        "coffee": 0.92,
        "apple": 0.85,
        "peas": 0.82
    },
    "ooty": {
        "tea": 0.98,
        "coffee": 0.92,
        "apple": 0.85,
        "peas": 0.82
    },
    "chennai": {
        "rice": 0.88,
        "ground nut": 0.82,
        "mung bean": 0.78,
        "watermelon": 0.75,
        "mango": 0.72
    },
    "kanchipuram": {
        "rice": 0.96,
        "sugarcane": 0.90,
        "ground nut": 0.88,
        "watermelon": 0.78
    },
    "cuddalore": {
        "rice": 0.96,
        "sugarcane": 0.94,
        "ground nut": 0.88,
        "banana": 0.82
    }
}

DEFAULT_CROP_PREVALENCE: Dict[str, float] = {
    "rice": 0.92,
    "maize": 0.88,
    "cotton": 0.85,
    "ground nut": 0.84,
    "sugarcane": 0.82,
    "wheat": 0.80,
    "mung bean": 0.75,
    "black gram": 0.75,
    "banana": 0.72,
    "coconut": 0.70,
    "chickpea": 0.68,
    "millet": 0.65,
    "lentil": 0.62,
    "watermelon": 0.60,
    "mango": 0.55,
    "tea": 0.35,
    "coffee": 0.35,
    "rubber": 0.20,
    "moth beans": 0.20,
    "jute": 0.30,
    "tobacco": 0.30
}

def get_crop_location_prevalence(location_str: str, crop_name: str) -> Tuple[float, bool]:
    """
    Returns (prevalence_score, is_location_matched) for a given location and crop.
    Prevalence score is bounded between 0.10 and 0.98.
    """
    if not location_str or not location_str.strip():
        c_norm = crop_name.lower().strip()
        return DEFAULT_CROP_PREVALENCE.get(c_norm, 0.50), False

    loc_norm = location_str.lower().strip()
    c_norm = crop_name.lower().strip()

    # Match district keyword in location string
    matched_map = None
    for district, crop_map in DISTRICT_CROP_PREVALENCE.items():
        if district in loc_norm or loc_norm in district:
            matched_map = crop_map
            break

    if matched_map:
        score = matched_map.get(c_norm, 0.40)
        return score, True

    return DEFAULT_CROP_PREVALENCE.get(c_norm, 0.50), False
