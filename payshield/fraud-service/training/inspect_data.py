import pandas as pd

df = pd.read_csv("../datasets/paysim_small.csv")

print("\n===== DATASET SHAPE =====")
print(df.shape)

print("\n===== COLUMN NAMES =====")
print(df.columns.tolist())

print("\n===== FIRST 5 ROWS =====")
print(df.head())

print("\n===== DATA TYPES =====")
print(df.dtypes)

print("\n===== MISSING VALUES =====")
print(df.isnull().sum())

print("\n===== FRAUD DISTRIBUTION =====")
print(df["isFraud"].value_counts())

print("\n===== FRAUD PERCENTAGE =====")
print(df["isFraud"].value_counts(normalize=True) * 100)

print("\n===== DATASET INFO =====")
df.info()