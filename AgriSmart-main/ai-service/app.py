from flask import Flask, request, jsonify
from flask_cors import CORS
from catboost import CatBoostClassifier
import pandas as pd

app = Flask(__name__)
CORS(app)

# ============================================================
# LOAD MODELS
# ============================================================

fertilizer_model = CatBoostClassifier()
fertilizer_model.load_model(
    "models/fertilizer_final.cbm"
)

irrigation_model = CatBoostClassifier()
irrigation_model.load_model(
    "models/irrigation_final.cbm"
)

print("========================================")
print("AgriSmart AI Models Loaded Successfully")
print("========================================")


# ============================================================
# HOME
# ============================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "message": "AgriSmart AI Service is running",
        "fertilizer_model": "loaded",
        "irrigation_model": "loaded"
    })


# ============================================================
# AI RECOMMENDATION
# ============================================================

@app.route("/api/ai/recommend", methods=["POST"])
def recommend():

    try:

        data = request.get_json()

        print("========================================")
        print("AI REQUEST")
        print(data)
        print("========================================")


        # ====================================================
        # FERTILIZER MODEL INPUT
        # ====================================================

        fertilizer_input = pd.DataFrame([{

            "Soil_Type":
                data.get("soil_type", "Clay"),

            "Soil_pH":
                float(data.get("soil_ph", 6.5)),

            "Soil_Moisture":
                float(data.get("soil_moisture", 35)),

            "Organic_Carbon":
                float(data.get("organic_carbon", 1.0)),

            "Electrical_Conductivity":
                float(data.get("electrical_conductivity", 1.0)),

            "Nitrogen_Level":
                float(data.get("nitrogen_level", 60)),

            "Phosphorus_Level":
                float(data.get("phosphorus_level", 40)),

            "Potassium_Level":
                float(data.get("potassium_level", 50)),

            "Temperature":
                float(data.get("temperature", 25)),

            "Humidity":
                float(data.get("humidity", 60)),

            "Rainfall":
                float(data.get("rainfall", 500)),

            "Crop_Type":
                data.get("crop_type", "Wheat"),

            "Crop_Growth_Stage":
                data.get("growth_stage", "Vegetative"),

            "Season":
                data.get("season", "Kharif"),

            "Irrigation_Type":
                data.get("irrigation_type", "Rainfed"),

            "Previous_Crop":
                data.get("previous_crop", "Wheat"),

            "Region":
                data.get("region", "South")

        }])


        # ====================================================
        # IRRIGATION MODEL INPUT
        # ====================================================

        irrigation_input = pd.DataFrame([{

            "Soil_Type":
                data.get("soil_type", "Clay"),

            "Soil_pH":
                float(data.get("soil_ph", 6.5)),

            "Soil_Moisture":
                float(data.get("soil_moisture", 35)),

            "Organic_Carbon":
                float(data.get("organic_carbon", 1.0)),

            "Electrical_Conductivity":
                float(data.get("electrical_conductivity", 1.0)),

            "Temperature_C":
                float(data.get("temperature", 25)),

            "Humidity":
                float(data.get("humidity", 60)),

            "Rainfall_mm":
                float(data.get("rainfall", 500)),

            "Sunlight_Hours":
                float(data.get("sunlight_hours", 8)),

            "Wind_Speed_kmh":
                float(data.get("wind_speed_kmh", 10)),

            "Crop_Type":
                data.get("crop_type", "Wheat"),

            "Crop_Growth_Stage":
                data.get("growth_stage", "Vegetative"),

            "Season":
                data.get("season", "Kharif"),

            "Irrigation_Type":
                data.get("irrigation_type", "Rainfed"),

            "Water_Source":
                data.get("water_source", "Borewell"),

            "Field_Area_hectare":
                float(data.get("field_area_hectare", 1)),

            "Mulching_Used":
                data.get("mulching_used", "No"),

            "Previous_Irrigation_mm":
                float(data.get("previous_irrigation_mm", 0)),

            "Region":
                data.get("region", "South")

        }])


        # ====================================================
        # PREDICTION
        # ====================================================

        fertilizer_prediction = fertilizer_model.predict(
            fertilizer_input
        )

        irrigation_prediction = irrigation_model.predict(
            irrigation_input
        )


        # CatBoost returns something like:
        # [['NPK']]
        #
        # We need only:
        # NPK

        fertilizer_prediction = str(
            fertilizer_prediction[0][0]
        )

        irrigation_prediction = str(
            irrigation_prediction[0][0]
        )


        print("========================================")
        print("FERTILIZER :", fertilizer_prediction)
        print("IRRIGATION :", irrigation_prediction)
        print("========================================")


        # ====================================================
        # RESPONSE
        # ====================================================

        return jsonify({

            "success": True,

            "fertilizerRecommendation":
                fertilizer_prediction,

            "irrigationRecommendation":
                irrigation_prediction

        })


    except Exception as e:

        print("========================================")
        print("AI ERROR:")
        print(str(e))
        print("========================================")

        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )