import pandas as pd

DATASET_PATH = "../datasets/311-service-requests-from-2010-to-present.csv"

print("Reading dataset columns and first rows...")

df = pd.read_csv(
    DATASET_PATH,
    nrows=10,
    low_memory=False
)

print("\nCOLUMNS:")
for i, col in enumerate(df.columns, start=1):
    print(f"{i}. {col}")

print("\nSHAPE OF SAMPLE:")
print(df.shape)

print("\nFIRST 5 ROWS:")
print(df.head())