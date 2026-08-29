from schemas.recommendation import RecommendationRequest
from services.location_service import get_crop_location_prevalence
import joblib
import pandas as pd

# Load trained model
model = joblib.load("models/crop_model.pkl")

# Load encoders
soil_encoder = joblib.load("models/soil_encoder.pkl")
season_encoder = joblib.load("models/season_encoder.pkl")
water_encoder = joblib.load("models/water_encoder.pkl")
crop_encoder = joblib.load("models/crop_encoder.pkl")

SOIL_MAP = {
    "acidic": "Acidic Soil",
    "acidic soil": "Acidic Soil",
    "alkaline": "Alkaline Soil",
    "alkaline soil": "Alkaline Soil",
    "peaty": "Peaty Soil",
    "peaty soil": "Peaty Soil",
    "neutral": "Neutral Soil",
    "neutral soil": "Neutral Soil",
    "loamy": "Loamy Soil",
    "loamy soil": "Loamy Soil",
    "clay": "Neutral Soil",
    "clay soil": "Neutral Soil",
    "red": "Neutral Soil",
    "red soil": "Neutral Soil",
    "black": "Neutral Soil",
    "black soil": "Neutral Soil",
    "sandy": "Loamy Soil",
    "sandy soil": "Loamy Soil"
}

SEASON_MAP = {
    "monsoon": "Monsoon",
    "post monsoon": "Post Monsoon",
    "summer": "Summer",
    "winter": "Winter",
    "kharif": "Monsoon",
    "rabi": "Winter",
    "zaid": "Summer"
}

WATER_MAP = {
    "high": "High",
    "medium": "Medium",
    "low": "Low",
    "canal": "High",
    "borewell": "Medium",
    "well": "Medium",
    "drip": "Medium",
    "rainfed": "Low"
}


class Predictor:

    def predict(self, request: RecommendationRequest):
        soil_raw = (request.soilType or "").strip().lower()
        soil_cat = SOIL_MAP.get(soil_raw, "Neutral Soil" if "red" in soil_raw or "black" in soil_raw else "Loamy Soil")

        season_raw = (request.season or "").strip().lower()
        season_cat = SEASON_MAP.get(season_raw, "Monsoon")

        water_raw = (request.waterAvailability or "").strip().lower()
        water_cat = WATER_MAP.get(water_raw, "Medium")

        # Encode categorical values for Random Forest model
        soil = soil_encoder.transform([soil_cat])[0]
        season = season_encoder.transform([season_cat])[0]
        water = water_encoder.transform([water_cat])[0]

        # Create dataframe in SAME ORDER as training dataset
        input_data = pd.DataFrame([{
            "Temperature": request.temperature,
            "Humidity": request.humidity,
            "Rainfall": request.rainfall,
            "PH": request.ph,
            "Nitrogen": request.nitrogen,
            "Phosphorus": request.phosphorus,
            "Potassium": request.potassium,
            "Soil": soil,
            "season": season,
            "waterAvailability": water
        }])

        # Predict raw probabilities across all 31 classes
        raw_probs = model.predict_proba(input_data)[0]

        # Clean display parameters for farmer-facing reasoning
        display_soil = (request.soilType or "Loamy Soil").strip().title()
        
        w_raw = (request.waterAvailability or "medium").strip().lower()
        if w_raw in ["canal"]:
            display_water = "canal irrigation"
        elif w_raw in ["borewell", "well"]:
            display_water = "borewell water"
        elif w_raw in ["drip"]:
            display_water = "drip irrigation"
        elif w_raw in ["rainfed", "low"]:
            display_water = "rainfed water"
        elif w_raw in ["high"]:
            display_water = "high water availability"
        else:
            display_water = f"{w_raw} water availability"

        # Sanitize location string (remove polygon coordinate leak if present)
        loc_raw = (request.location or "").strip()
        clean_loc = loc_raw.split(" | ")[0].strip() if " | " in loc_raw else loc_raw
        if "[" in clean_loc:
            clean_loc = clean_loc.split("[")[0].strip()
        display_loc = clean_loc.title()

        scored_crops = []

        for idx, prob in enumerate(raw_probs):
            crop_name = str(crop_encoder.inverse_transform([idx])[0])
            loc_score, is_loc_match = get_crop_location_prevalence(clean_loc, crop_name)

            # Combined Score Formula:
            # Agricultural suitability (RF probability) weighted 0.65
            # Location prevalence weighted 0.35
            agri_weight = 0.65
            loc_weight = 0.35

            if prob < 0.005:
                combined_score = prob * 0.01
            else:
                combined_score = (prob * agri_weight) + (loc_score * loc_weight)

            scored_crops.append({
                "idx": idx,
                "cropName": crop_name,
                "raw_prob": float(prob),
                "loc_score": float(loc_score),
                "combined_score": float(combined_score),
                "is_loc_match": is_loc_match
            })

        # Sort descending by combined_score
        scored_crops.sort(key=lambda item: item["combined_score"], reverse=True)

        # Take TOP 5 recommendations
        top5_items = scored_crops[:5]
        max_score = top5_items[0]["combined_score"] if top5_items[0]["combined_score"] > 0 else 1.0

        recommendations = []
        base_pcts = [0.95, 0.88, 0.82, 0.76, 0.70]

        for i, item in enumerate(top5_items):
            c_name = item["cropName"]
            c_title = c_name.title()
            
            # Clean crop titles
            if c_name.lower() in ["rice", "wheat", "cotton", "maize", "sugarcane", "coconut", "banana", "tea", "coffee", "rubber", "mango"]:
                c_title = c_name.capitalize()
            elif c_name.lower() == "ground nut":
                c_title = "Groundnut"
            elif c_name.lower() == "mung bean":
                c_title = "Mung Bean (Green Gram)"
            elif c_name.lower() == "black gram":
                c_title = "Black Gram (Urad)"
            elif c_name.lower() == "pigeon peas":
                c_title = "Pigeon Peas (Toor Dal)"

            rel_ratio = item["combined_score"] / max_score
            scaled_conf = round(base_pcts[i] * (0.85 + 0.15 * rel_ratio), 4)

            reason_str = f"Suitable for {display_soil} and {display_water}."
            if display_loc and item["is_loc_match"]:
                reason_str += f" High regional cultivation rate in {display_loc}."

            recommendations.append({
                "cropName": c_title,
                "crop": c_title,
                "confidence": scaled_conf,
                "reasoning": reason_str
            })

        return {"recommendations": recommendations}