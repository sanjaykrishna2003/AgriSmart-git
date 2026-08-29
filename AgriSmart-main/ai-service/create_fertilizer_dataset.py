import pandas as pd
import random

random.seed(42)

crops = [
    "Paddy",
    "Wheat",
    "Maize",
    "Cotton",
    "Sugarcane",
    "Ground Nuts",
    "Pulses",
    "Millets"
]

soil_types = [
    "Loamy",
    "Clayey",
    "Sandy",
    "Black",
    "Red"
]

growth_stages = [
    "Seedling",
    "Vegetative",
    "Flowering",
    "Maturity"
]

rows = []

for _ in range(10000):

    crop = random.choice(crops)
    soil = random.choice(soil_types)
    stage = random.choice(growth_stages)

    nitrogen = random.randint(5, 100)
    phosphorus = random.randint(5, 80)
    potassium = random.randint(5, 80)

    ph = round(random.uniform(5.0, 8.0), 1)

    temperature = random.randint(20, 40)
    humidity = random.randint(40, 90)
    rainfall = random.randint(0, 200)
    moisture = random.randint(20, 80)

    # Determine nutrient deficiency
    if nitrogen < 30:
        recommendation = "Urea"
    elif phosphorus < 25:
        recommendation = "DAP"
    elif potassium < 25:
        recommendation = "MOP"
    elif nitrogen < 50 and phosphorus < 40 and potassium < 40:
        recommendation = "NPK"
    else:
        recommendation = "No Fertilizer Required"

    rows.append([
        crop,
        soil,
        stage,
        nitrogen,
        phosphorus,
        potassium,
        ph,
        temperature,
        humidity,
        rainfall,
        moisture,
        recommendation
    ])

columns = [
    "Crop",
    "SoilType",
    "GrowthStage",
    "Nitrogen",
    "Phosphorus",
    "Potassium",
    "pH",
    "Temperature",
    "Humidity",
    "Rainfall",
    "Moisture",
    "Fertilizer"
]

df = pd.DataFrame(rows, columns=columns)

df.to_csv(
    "dataset/fertilizer_training.csv",
    index=False
)

print("Dataset created successfully!")
print("Rows:", len(df))
print("\nDistribution:")
print(df["Fertilizer"].value_counts())