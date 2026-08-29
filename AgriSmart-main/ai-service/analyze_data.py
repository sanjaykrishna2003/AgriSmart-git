import pandas as pd

# Load dataset
data = pd.read_csv("dataset/fertilizer.csv")

print("\n========== FERTILIZER DISTRIBUTION ==========")

fertilizer_counts = data["Fertilizer Name"].value_counts()

print(fertilizer_counts)

print("\n========== FERTILIZER PERCENTAGE ==========")

fertilizer_percentage = (
    data["Fertilizer Name"]
    .value_counts(normalize=True)
    .mul(100)
    .round(2)
)

print(fertilizer_percentage)

print("\n========== CROP DISTRIBUTION ==========")

print(data["Crop Type"].value_counts())

print("\n========== SOIL TYPE DISTRIBUTION ==========")

print(data["Soil Type"].value_counts())