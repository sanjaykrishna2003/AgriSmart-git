import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report


data = pd.read_csv(
    "dataset/irrigation_training.csv"
)

X = data.drop(
    "Irrigation",
    axis=1
)

y = data["Irrigation"]


categorical_columns = [
    "Crop",
    "SoilType",
    "GrowthStage"
]

preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(
                handle_unknown="ignore"
            ),
            categorical_columns
        )
    ],
    remainder="passthrough"
)


model = RandomForestClassifier(
    n_estimators=150,
    random_state=42
)


pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("model", model)
])


X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


print("Training irrigation model...")

pipeline.fit(
    X_train,
    y_train
)


predictions = pipeline.predict(
    X_test
)


accuracy = accuracy_score(
    y_test,
    predictions
)

print("\n========== IRRIGATION PERFORMANCE ==========")

print(
    "Accuracy:",
    round(accuracy * 100, 2),
    "%"
)

print(
    classification_report(
        y_test,
        predictions
    )
)


joblib.dump(
    pipeline,
    "models/irrigation_model.pkl"
)

print("\nIrrigation model saved!")