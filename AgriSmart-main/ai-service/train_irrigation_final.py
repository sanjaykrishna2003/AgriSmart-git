import pandas as pd

from catboost import CatBoostClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.metrics import confusion_matrix, f1_score


# ============================================================
# LOAD DATA
# ============================================================

df = pd.read_csv("dataset/irrigation_real.csv")

print("Dataset shape:", df.shape)

TARGET = "Irrigation_Need"

X = df.drop(columns=[TARGET])
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
    "Water_Source",
    "Mulching_Used",
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
# MODEL
# ============================================================

model = CatBoostClassifier(
    iterations=400,
    depth=7,
    learning_rate=0.07,
    loss_function="MultiClass",
    eval_metric="TotalF1",
    random_seed=42,
    verbose=100,
    thread_count=-1
)


# ============================================================
# TRAIN
# ============================================================

print("\n========== TRAINING IRRIGATION MODEL ==========")

model.fit(
    X_train,
    y_train,
    cat_features=categorical_indices,
    eval_set=(X_test, y_test),
    early_stopping_rounds=80
)


# ============================================================
# PREDICTION
# ============================================================

predictions = model.predict(X_test).flatten()


# ============================================================
# PERFORMANCE
# ============================================================

accuracy = accuracy_score(
    y_test,
    predictions
)

weighted_f1 = f1_score(
    y_test,
    predictions,
    average="weighted"
)

print("\n========== FINAL PERFORMANCE ==========")

print(f"Test Accuracy : {accuracy * 100:.2f}%")
print(f"Weighted F1   : {weighted_f1 * 100:.2f}%")


# ============================================================
# CLASSIFICATION REPORT
# ============================================================

print("\n========== CLASSIFICATION REPORT ==========")

print(
    classification_report(
        y_test,
        predictions,
        zero_division=0
    )
)


# ============================================================
# CONFUSION MATRIX
# ============================================================

print("\n========== CONFUSION MATRIX ==========")

print(
    confusion_matrix(
        y_test,
        predictions
    )
)


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

print(
    importance.to_string(index=False)
)


# ============================================================
# SAVE MODEL
# ============================================================

model.save_model(
    "models/irrigation_final.cbm"
)

print("\nModel saved:")
print("models/irrigation_final.cbm")