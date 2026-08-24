import pandas as pd

DATASET_PATH = "../datasets/311-service-requests-from-2010-to-present.csv"

TARGET_TYPES = [
    "Street Condition",
    "Highway Condition",
    "Curb Condition",
    "DEP Street Condition",

    "Water System",
    "WATER LEAK",
    "Water Quality",
    "Water Conservation",
    "Drinking Water",

    "Sewer",
    "Standing Water",
    "Indoor Sewage",

    "Dirty Conditions",
    "Missed Collection (All Materials)",
    "Sanitation Condition",
    "Recycling Enforcement",

    "ELECTRIC",
    "Electrical",
    "Street Light Condition",

    "Air Quality",
    "Hazardous Materials",
    "Asbestos",
    "Mosquitoes",
    "Indoor Air Quality",
]

CHUNK_SIZE = 250_000

descriptor_counts = {}

print("Scanning relevant Complaint Type + Descriptor values...")

for chunk_number, chunk in enumerate(
    pd.read_csv(
        DATASET_PATH,
        usecols=["Complaint Type", "Descriptor"],
        chunksize=CHUNK_SIZE,
        low_memory=False,
    ),
    start=1,
):
    filtered = chunk[
        chunk["Complaint Type"].isin(TARGET_TYPES)
    ].dropna(subset=["Descriptor"])

    counts = (
        filtered
        .groupby(["Complaint Type", "Descriptor"])
        .size()
    )

    for key, count in counts.items():
        descriptor_counts[key] = descriptor_counts.get(key, 0) + count

    print(f"Processed chunk {chunk_number}")

results = (
    pd.Series(descriptor_counts)
    .sort_values(ascending=False)
)

print("\n======================================")
print("TOP DESCRIPTORS BY COMPLAINT TYPE")
print("======================================")

for complaint_type in TARGET_TYPES:
    print(f"\n--- {complaint_type} ---")

    try:
        type_results = results.xs(complaint_type, level=0)
        print(type_results.head(20).to_string())
    except KeyError:
        print("No descriptors found.")