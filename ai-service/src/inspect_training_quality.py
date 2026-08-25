import pandas as pd
from pathlib import Path

# =========================================================
# PATH
# =========================================================

DATASET_PATH = Path(
    "../datasets/final_complaint_training_dataset_v2.csv"
)

# =========================================================
# LOAD DATA
# =========================================================

df = pd.read_csv(DATASET_PATH)

df = df[
    ["complaint_text", "category"]
].dropna()

df["complaint_text"] = (
    df["complaint_text"]
    .astype(str)
    .str.strip()
)

df["category"] = (
    df["category"]
    .astype(str)
    .str.strip()
)

print("=" * 75)
print("CATEGORY TRAINING DATASET QUALITY INSPECTION")
print("=" * 75)

print(f"\nDataset Shape: {df.shape}")

# =========================================================
# CATEGORY DISTRIBUTION
# =========================================================

print("\n" + "=" * 75)
print("CATEGORY DISTRIBUTION")
print("=" * 75)

print(
    df["category"]
    .value_counts()
    .sort_index()
)

# =========================================================
# EXACT DUPLICATES
# =========================================================

duplicate_count = df.duplicated(
    subset=["complaint_text"]
).sum()

print("\n" + "=" * 75)
print("EXACT DUPLICATE COMPLAINTS")
print("=" * 75)

print(
    f"\nExact duplicate complaint texts: "
    f"{duplicate_count}"
)

# =========================================================
# NORMALIZED DUPLICATES
# =========================================================

df["normalized_text"] = (
    df["complaint_text"]
    .str.lower()
    .str.replace(
        r"[^a-z0-9\s]",
        "",
        regex=True,
    )
    .str.replace(
        r"\s+",
        " ",
        regex=True,
    )
    .str.strip()
)

normalized_duplicates = df.duplicated(
    subset=["normalized_text"]
).sum()

print("\n" + "=" * 75)
print("NORMALIZED DUPLICATES")
print("=" * 75)

print(
    f"\nNormalized duplicate texts: "
    f"{normalized_duplicates}"
)

# =========================================================
# CONFLICTING LABELS
# =========================================================

label_counts = (
    df.groupby("normalized_text")["category"]
    .nunique()
)

conflicting_texts = label_counts[
    label_counts > 1
].index

conflicts = df[
    df["normalized_text"].isin(
        conflicting_texts
    )
].sort_values(
    "normalized_text"
)

print("\n" + "=" * 75)
print("CONFLICTING CATEGORY LABELS")
print("=" * 75)

print(
    f"\nTexts appearing under multiple categories: "
    f"{len(conflicting_texts)}"
)

if len(conflicts) > 0:
    print(
        conflicts[
            [
                "complaint_text",
                "category",
            ]
        ]
        .head(30)
        .to_string(index=False)
    )

# =========================================================
# UNIQUE TEXTS BY CATEGORY
# =========================================================

print("\n" + "=" * 75)
print("UNIQUE TEXTS BY CATEGORY")
print("=" * 75)

for category in sorted(
    df["category"].unique()
):
    category_df = df[
        df["category"] == category
    ]

    unique_count = (
        category_df["normalized_text"]
        .nunique()
    )

    total_count = len(category_df)

    ratio = (
        unique_count / total_count
        if total_count
        else 0
    )

    print(
        f"{category:15} "
        f"Total: {total_count:4} | "
        f"Unique: {unique_count:4} | "
        f"Unique Ratio: {ratio:.2%}"
    )

# =========================================================
# TEXT LENGTH
# =========================================================

df["word_count"] = (
    df["complaint_text"]
    .str.split()
    .str.len()
)

print("\n" + "=" * 75)
print("TEXT LENGTH BY CATEGORY")
print("=" * 75)

length_stats = (
    df.groupby("category")["word_count"]
    .agg(
        [
            "min",
            "mean",
            "median",
            "max",
        ]
    )
    .round(2)
)

print(length_stats)

# =========================================================
# SAMPLE TRAINING RECORDS
# =========================================================

print("\n" + "=" * 75)
print("RANDOM TRAINING EXAMPLES")
print("=" * 75)

for category in sorted(
    df["category"].unique()
):
    print(
        f"\n--- {category.upper()} ---"
    )

    samples = (
        df[
            df["category"] == category
        ]["complaint_text"]
        .sample(
            n=min(
                10,
                len(
                    df[
                        df["category"]
                        == category
                    ]
                ),
            ),
            random_state=42,
        )
    )

    for index, text in enumerate(
        samples,
        start=1,
    ):
        print(
            f"{index:02}. {text}"
        )

print("\n" + "=" * 75)
print("INSPECTION COMPLETE")
print("=" * 75)