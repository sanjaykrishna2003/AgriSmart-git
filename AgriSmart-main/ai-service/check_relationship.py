import pandas as pd

data = pd.read_csv("dataset/fertilizer.csv")

print("\n========== AVERAGE VALUES BY FERTILIZER ==========")

result = data.groupby("Fertilizer Name")[
    [
        "Temparature",
        "Humidity",
        "Moisture",
        "Nitrogen",
        "Potassium",
        "Phosphorous"
    ]
].mean()

print(result.round(2))


print("\n========== FERTILIZER vs CROP ==========")

crop_fertilizer = pd.crosstab(
    data["Crop Type"],
    data["Fertilizer Name"]
)

print(crop_fertilizer)


print("\n========== FERTILIZER vs SOIL ==========")

soil_fertilizer = pd.crosstab(
    data["Soil Type"],
    data["Fertilizer Name"]
)

print(soil_fertilizer)