import pandas as pd
import numpy as np

from catboost import CatBoostClassifier
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score
)

# ============================================================
# LOAD DATA
# ============================================================

df = pd.read_csv("dataset/fertilizer_real.csv")

print("Dataset shape:", df.shape)

TARGET = "Recommended_Fertilizer"

DROP_COLUMNS = [
    TARGET,
    "Fertilizer_Used_Last_Season",
    "Yield_Last_Season"
]

X = df.drop(columns=DROP_COLUMNS)
y = df[TARGET]


# ============================================================
# CATEGORICAL FEATURES
# ============================================================

categorical_columns = [
    "Soil_Type",
    "Crop_Type",
    "Crop_Growth_Stage",
    "Season",
    "Irrigation_Type",
    "Previous_Crop",
    "Region"
]

categorical_indices = [
    X.columns.get_loc(column)
    for column in categorical_columns
]


# ============================================================
# TRAIN / TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("\nTraining samples:", len(X_train))
print("Testing samples:", len(X_test))


# ============================================================
# CATBOOST MODEL
# ============================================================

model = CatBoostClassifier(
    iterations=400,
    depth=7,
    learning_rate=0.07,
    loss_function="MultiClass",
    eval_metric="TotalF1",

    class_weights={
        "Compost": 1.0,
        "DAP": 1.0,
        "MOP": 1.0,
        "NPK": 1.2,
        "SSP": 2.0,
        "Urea": 1.0,
        "Zinc Sulphate": 1.2
    },

    random_seed=42,
    verbose=100,
    thread_count=-1
)


# ============================================================
# TRAIN
# ============================================================

print("\n========== TRAINING FERTILIZER MODEL ==========")

model.fit(
    X_train,
    y_train,
    cat_features=categorical_indices,
    eval_set=(X_test, y_test),
    early_stopping_rounds=80
)


# ============================================================
# TEST
# ============================================================

predictions = model.predict(X_test)

predictions = predictions.flatten()


accuracy = accuracy_score(
    y_test,
    predictions
)

f1 = f1_score(
    y_test,
    predictions,
    average="weighted"
)


print("\n========== FINAL PERFORMANCE ==========")

print(
    f"Test Accuracy : {accuracy * 100:.2f}%"
)

print(
    f"Weighted F1   : {f1 * 100:.2f}%"
)


print("\n========== CLASSIFICATION REPORT ==========")

print(
    classification_report(
        y_test,
        predictions,
        zero_division=0
    )
)


print("\n========== CONFUSION MATRIX ==========")

print(
    confusion_matrix(
        y_test,
        predictions
    )
)


# ============================================================
# CROSS VALIDATION
# ============================================================

""" print("\n========== 5-FOLD CROSS VALIDATION ==========")

cv = StratifiedKFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)

cv_scores = cross_val_score(
    model,
    X,
    y,
    cv=cv,
    scoring="accuracy",
    params={
        "cat_features": categorical_indices
    }
)

print("CV scores:", cv_scores)

print(
    f"Mean CV Accuracy: {cv_scores.mean() * 100:.2f}%"
)

print(
    f"CV Std: {cv_scores.std() * 100:.2f}%"
)
 """

# ============================================================
# FEATURE IMPORTANCE
# ============================================================

importance = pd.DataFrame({
    "Feature": X.columns,
    "Importance": model.get_feature_importance()
})

importance = importance.sort_values(
    by="Importance",
    ascending=False
)

print("\n========== FEATURE IMPORTANCE ==========")

print(importance.to_string(index=False))


# ============================================================
# SAVE MODEL
# ============================================================

model.save_model(
    "models/fertilizer_final.cbm"
)

print("\nModel saved:")
print("models/fertilizer_final.cbm")