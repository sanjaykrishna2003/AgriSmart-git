import pandas as pd
from sklearn.preprocessing import LabelEncoder
df = pd.read_csv("data/final_dataset.csv")

print(df.head())
x = df.drop(["Crop", "Carbon"], axis=1)
y = df["Crop"]


soil_encoder = LabelEncoder()
season_encoder = LabelEncoder()
water_encoder = LabelEncoder()

x["Soil"] = soil_encoder.fit_transform(x["Soil"])
x["season"] = season_encoder.fit_transform(x["season"])
x["waterAvailability"] = water_encoder.fit_transform(x["waterAvailability"])
crop_encoder = LabelEncoder()

y = crop_encoder.fit_transform(y)
from sklearn.model_selection import train_test_split

x_train, x_test, y_train, y_test = train_test_split(
    x,
    y,
    test_size=0.2,
    random_state=42
)
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42
)
print(x.columns)
model.fit(x_train, y_train)
accuracy = model.score(x_test, y_test)

print("Accuracy:", accuracy)
import joblib

joblib.dump(model, "models/crop_model.pkl")
joblib.dump(soil_encoder, "models/soil_encoder.pkl")
joblib.dump(season_encoder, "models/season_encoder.pkl")
joblib.dump(water_encoder, "models/water_encoder.pkl")
joblib.dump(crop_encoder, "models/crop_encoder.pkl")
print("Model saved successfully!")
print(soil_encoder.classes_)
print(sorted(df["Soil"].unique()))