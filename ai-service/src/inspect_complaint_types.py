import pandas as pd

DATASET_PATH = "../datasets/311-service-requests-from-2010-to-present.csv"

CHUNK_SIZE = 250_000

complaint_counts = {}

print("Scanning Complaint Type values...")

for chunk_number, chunk in enumerate(
    pd.read_csv(
        DATASET_PATH,
        usecols=["Complaint Type"],
        chunksize=CHUNK_SIZE,
        low_memory=False,
    ),
    start=1,
):
    counts = chunk["Complaint Type"].value_counts(dropna=False)

    for complaint_type, count in counts.items():
        complaint_counts[complaint_type] = (
            complaint_counts.get(complaint_type, 0) + count
        )

    print(
        f"Processed chunk {chunk_number} "
        f"({chunk_number * CHUNK_SIZE:,} rows maximum)"
    )

results = pd.Series(complaint_counts).sort_values(ascending=False)

print("\n======================================")
print("TOTAL UNIQUE COMPLAINT TYPES")
print("======================================")
print(len(results))

print("\n======================================")
print("TOP 100 COMPLAINT TYPES")
print("======================================")
print(results.head(100).to_string())