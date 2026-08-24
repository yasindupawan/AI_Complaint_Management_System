import pandas as pd
from pathlib import Path

RAW_DATASET = Path("../datasets/311-service-requests-from-2010-to-present.csv")
OUTPUT_DATASET = Path("../datasets/nyc311_training_dataset.csv")

CHUNK_SIZE = 250_000
TARGET_PER_CATEGORY = 20_000

# ---------------------------------------------------------
# Clean descriptor-level mapping
# ---------------------------------------------------------

CATEGORY_MAPPING = {
    "roads": {
        "Pothole",
        "Cave-in",
        "Failed Street Repair",
        "Defective Hardware",
        "Rough, Pitted or Cracked Roads",
        "Wear & Tear",
        "Broken Curb",
        "Curb Defect-Metal Protruding",
        "Pothole - Highway",
    },

    "water_supply": {
        "Dirty Water (WE)",
        "Leak (Use Comments) (WA2)",
        "Possible Water Main Break (Use Comments) (WA1)",
        "LOW WATER PRESSURE - WLWP",
        "No Water (WNW)",
        "Hydrant Leaking (WC1)",
        "HEAVY FLOW",
        "SLOW LEAK",
        "DAMP SPOT",
        "Taste/Odor, Chlorine (QA1)",
        "Cloudy Or Milky, Other (Use Comments) (QBZ)",
        "unknown odor/taste in drinking water (QA6)",
        "Taste/Odor, Bitter/Metallic (QA3)",
    },

    "drainage": {
        "Sewer Backup (Use Comments) (SA)",
        "Catch Basin Clogged/Flooding (Use Comments) (SC)",
        "Street Flooding (SJ)",
        "Manhole Overflow (Use Comments) (SA1)",
        "Culvert Blocked/Needs Cleaning (SE)",
        "RAIN GARDEN FLOODING (SRGFLD)",
        "Sewage Leak",
        "Sewage Odor",
        "Sewer or Drain",
        "Ponding",
    },

    "garbage": {
        "E3 Dirty Sidewalk",
        "E3A Dirty Area/Alleyway",
        "E1 Improper Disposal",
        "E2 Receptacle Violation",
        "E5 Loose Rubbish",
        "1 Missed Collection",
        "2 Bulk-Missed Collection",
        "1R Missed Recycling-All Materials",
        "2R Bulk-Missed Recy Collection",
        "1RB Missed Recycling - M/G/Pl",
        "1RG Missed Recycling Paper",
        "15 Street Cond/Dump-Out/Drop-Off",
    },

    "electricity": {
        "NO LIGHTING",
        "POWER OUTAGE",
        "WIRING",
        "LIGHTING",
        "OUTLET/SWITCH",
        "Electrical Wiring Defective/Exposed",
        "Street Light Out",
        "Multiple Street Lights Out",
        "Lamppost Wire Exposed",
        "Lamppost Knocked Down",
        "Street Light Lamp Dim",
    },

    "environment": {
        "Air: Odor/Fumes, Vehicle Idling (AD3)",
        "Air: Dust, Construction/Demolition (AE4)",
        "Air: Odor/Fumes, Restaurant (AD2)",
        "Air: Dust, Other (Use Comments) (AE5)",
        "Air: Other Air Problem (Use Comments) (AZZ)",
        "Air: Smoke, Vehicular (AA4)",
        "Air: Smoke, Chimney or vent (AS1)",
        "Chemical Odor (HD1)",
        "Oil Spill On Street, Large (HQL)",
        "Chemical Spill/Release (HA1)",
        "Oil Spill On Street, Small (HQS)",
        "Unsafe Chemical, Storage (HC1)",
        "Unsafe Chemical, Abandoned (HC2)",
        "Asbestos Complaint (B1)",
        "Large Number of Mosquitoes",
        "Chemical Vapors/Gases/Odors",
        "Ventilation",
    },
}

# Reverse lookup: descriptor -> category
DESCRIPTOR_TO_CATEGORY = {}

for category, descriptors in CATEGORY_MAPPING.items():
    for descriptor in descriptors:
        DESCRIPTOR_TO_CATEGORY[descriptor] = category


# ---------------------------------------------------------
# Storage
# ---------------------------------------------------------

collected = {
    category: []
    for category in CATEGORY_MAPPING
}

required_columns = [
    "Complaint Type",
    "Descriptor",
    "Agency",
    "Agency Name",
    "Borough",
]


print("=" * 70)
print("BUILDING NYC 311 TRAINING DATASET")
print("=" * 70)


# ---------------------------------------------------------
# Read large dataset in chunks
# ---------------------------------------------------------

for chunk_number, chunk in enumerate(
    pd.read_csv(
        RAW_DATASET,
        usecols=required_columns,
        chunksize=CHUNK_SIZE,
        low_memory=False,
    ),
    start=1,
):

    # Remove rows without useful labels
    chunk = chunk.dropna(
        subset=["Complaint Type", "Descriptor"]
    )

    # Keep only descriptors selected above
    chunk = chunk[
        chunk["Descriptor"].isin(DESCRIPTOR_TO_CATEGORY)
    ].copy()

    if chunk.empty:
        print(f"Chunk {chunk_number}: no relevant rows")
        continue

    # Map descriptor to our final category
    chunk["category"] = chunk["Descriptor"].map(
        DESCRIPTOR_TO_CATEGORY
    )

    # Build text feature
    chunk["training_text"] = (
        chunk["Complaint Type"].astype(str).str.strip()
        + " "
        + chunk["Descriptor"].astype(str).str.strip()
    )

    # Remove empty text
    chunk["training_text"] = (
        chunk["training_text"]
        .str.replace(r"\s+", " ", regex=True)
        .str.strip()
    )

    # Collect per category
    for category in CATEGORY_MAPPING:

        remaining = TARGET_PER_CATEGORY - sum(
            len(df) for df in collected[category]
        )

        if remaining <= 0:
            continue

        category_rows = chunk[
            chunk["category"] == category
        ].copy()

        if category_rows.empty:
            continue

        category_rows = category_rows[
            [
                "training_text",
                "category",
                "Complaint Type",
                "Descriptor",
                "Agency",
                "Agency Name",
                "Borough",
            ]
        ]

        collected[category].append(
            category_rows.head(remaining)
        )

    counts = {
        category: sum(len(df) for df in frames)
        for category, frames in collected.items()
    }

    print(
        f"Chunk {chunk_number} processed | "
        + " | ".join(
            f"{category}: {count:,}"
            for category, count in counts.items()
        )
    )

    # Stop once all categories reach target
    if all(
        count >= TARGET_PER_CATEGORY
        for count in counts.values()
    ):
        print("\nTarget reached for all categories.")
        break


# ---------------------------------------------------------
# Combine
# ---------------------------------------------------------

frames = []

for category, category_frames in collected.items():

    if not category_frames:
        print(f"WARNING: No records collected for {category}")
        continue

    category_df = pd.concat(
        category_frames,
        ignore_index=True
    )

    # Remove exact duplicate text within category
    category_df = category_df.drop_duplicates(
        subset=["training_text", "category"]
    )

    frames.append(category_df)


final_df = pd.concat(
    frames,
    ignore_index=True
)


# ---------------------------------------------------------
# Remove duplicate text across categories
# ---------------------------------------------------------

duplicate_text_categories = (
    final_df.groupby("training_text")["category"]
    .nunique()
)

ambiguous_texts = duplicate_text_categories[
    duplicate_text_categories > 1
].index

if len(ambiguous_texts) > 0:
    final_df = final_df[
        ~final_df["training_text"].isin(
            ambiguous_texts
        )
    ]


# ---------------------------------------------------------
# Rebalance after duplicate removal
# ---------------------------------------------------------

balanced_frames = []

for category in CATEGORY_MAPPING:

    category_df = final_df[
        final_df["category"] == category
    ].copy()

    n = min(
        TARGET_PER_CATEGORY,
        len(category_df)
    )

    if n == 0:
        continue

    category_df = category_df.sample(
        n=n,
        random_state=42
    )

    balanced_frames.append(category_df)


final_df = pd.concat(
    balanced_frames,
    ignore_index=True
)

final_df = final_df.sample(
    frac=1,
    random_state=42
).reset_index(drop=True)


# ---------------------------------------------------------
# Save
# ---------------------------------------------------------

final_df.to_csv(
    OUTPUT_DATASET,
    index=False
)


# ---------------------------------------------------------
# Final report
# ---------------------------------------------------------

print("\n" + "=" * 70)
print("FINAL DATASET CREATED")
print("=" * 70)

print(f"\nSaved to:\n{OUTPUT_DATASET}")

print(
    f"\nFinal Shape: {final_df.shape}"
)

print("\nCategory Distribution:")
print(
    final_df["category"]
    .value_counts()
    .sort_index()
)

print(
    "\nExact Duplicate Rows:",
    final_df.duplicated().sum()
)

print(
    "Duplicate training_text + category:",
    final_df.duplicated(
        subset=["training_text", "category"]
    ).sum()
)

print(
    "\nUnique Training Text:",
    final_df["training_text"].nunique()
)

print("\nSample:")
print(
    final_df[
        [
            "training_text",
            "category",
            "Complaint Type",
            "Descriptor",
        ]
    ].head(10)
)