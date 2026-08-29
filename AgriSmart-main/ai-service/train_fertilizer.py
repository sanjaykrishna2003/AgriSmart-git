import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report


# Load dataset
data = pd.read_csv("dataset/fertilizer_training.csv")

print("Dataset loaded!")
print("Rows:", len(data))


# Features
X = data.drop("Fertilizer", axis=1)

# Target
y = data["Fertilizer"]


# Categorical columns
categorical_columns = [
    "Crop",
    "SoilType",
    "GrowthStage"
]

# Numerical columns
numerical_columns = [
    "Nitrogen",
    "Phosphorus",
    "Potassium",
    "pH",
    "Temperature",
    "Humidity",
    "Rainfall",
    "Moisture"
]


# Preprocessing
preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_columns
        )
    ],
    remainder="passthrough"
)


# Model
model = RandomForestClassifier(
    n_estimators=150,
    random_state=42
)


# Pipeline
pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("model", model)
])


# Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


print("Training model...")

pipeline.fit(X_train, y_train)

print("Training completed!")


# Prediction
predictions = pipeline.predict(X_test)


# Accuracy
accuracy = accuracy_score(
    y_test,
    predictions
)

print("\n========== MODEL PERFORMANCE ==========")
print(
    "Accuracy:",
    round(accuracy * 100, 2),
    "%"
)

print("\n========== CLASSIFICATION REPORT ==========")

print(
    classification_report(
        y_test,
        predictions
    )
)


# Save model
joblib.dump(
    pipeline,
    "models/fertilizer_model.pkl"
)

print("\nModel saved!")