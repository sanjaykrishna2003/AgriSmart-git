import pandas as pd

# Load dataset
data = pd.read_csv("dataset/fertilizer.csv")

print("\n========== DATASET SHAPE ==========")
print(data.shape)

print("\n========== COLUMN NAMES ==========")
print(data.columns.tolist())

print("\n========== FIRST 5 ROWS ==========")
print(data.head())

print("\n========== DATA TYPES ==========")
print(data.dtypes)

print("\n========== MISSING VALUES ==========")
print(data.isnull().sum())

print("\n========== DUPLICATE ROWS ==========")
print(data.duplicated().sum())

print("\n========== BASIC INFORMATION ==========")
print(data.info())

print("\n========== UNIQUE VALUES ==========")

for column in data.columns:
    print(f"\n{column}:")
    print(data[column].unique())

print("\n========== DATASET DESCRIPTION ==========")
print(data.describe(include="all"))