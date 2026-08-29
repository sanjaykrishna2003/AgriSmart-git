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

    moisture = random.randint(15, 80)
    temperature = random.randint(20, 42)
    humidity = random.randint(35, 90)
    rainfall = random.randint(0, 150)

    # Simple irrigation rule
    if rainfall > 50:
        irrigation = "No Irrigation"
    elif moisture < 30:
        irrigation = "High"
    elif moisture < 50:
        irrigation = "Medium"
    else:
        irrigation = "Low"

    rows.append([
        crop,
        soil,
        stage,
        moisture,
        temperature,
        humidity,
        rainfall,
        irrigation
    ])


columns = [
    "Crop",
    "SoilType",
    "GrowthStage",
    "Moisture",
    "Temperature",
    "Humidity",
    "Rainfall",
    "Irrigation"
]

df = pd.DataFrame(
    rows,
    columns=columns
)

df.to_csv(
    "dataset/irrigation_training.csv",
    index=False
)

print("Irrigation dataset created!")
print("Rows:", len(df))

print(
    df["Irrigation"].value_counts()
)