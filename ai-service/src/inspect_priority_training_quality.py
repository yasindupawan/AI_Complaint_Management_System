import re
from pathlib import Path

import pandas as pd


# =========================================================
# PATHS
# =========================================================

CURRENT_DIR = Path(__file__).resolve().parent
AI_SERVICE_DIR = CURRENT_DIR.parent
DATASETS_DIR = AI_SERVICE_DIR / "datasets"

# Current priority training dataset
PRIORITY_DATASET = (
    DATASETS_DIR
    / "priority"
    / "priority_training_dataset_v2.csv"
)

RANDOM_STATE = 42


# =========================================================
# NORMALIZATION
# =========================================================

def normalize_text(text):
    text = str(text).strip().lower()

    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    text = re.sub(
        r"[^a-z0-9\s]",
        "",
        text,
    )

    return text.strip()


# =========================================================
# LOAD DATASET
# =========================================================

print("=" * 75)
print("PRIORITY TRAINING DATASET QUALITY INSPECTION")
print("=" * 75)

if not PRIORITY_DATASET.exists():
    raise FileNotFoundError(
        f"Priority dataset not found:\n"
        f"{PRIORITY_DATASET}"
    )

df = pd.read_csv(
    PRIORITY_DATASET
)

print(
    f"\nDataset File : {PRIORITY_DATASET.name}"
)

print(
    f"Dataset Shape: {df.shape}"
)


# =========================================================
# COLUMN CHECK
# =========================================================

print("\n" + "=" * 75)
print("DATASET COLUMNS")
print("=" * 75)

print(
    df.columns.tolist()
)

possible_text_columns = [
    "complaint_text",
    "training_text",
    "text",
]

possible_target_columns = [
    "priority",
    "priority_label",
    "label",
]


text_column = next(
    (
        column
        for column in possible_text_columns
        if column in df.columns
    ),
    None,
)

priority_column = next(
    (
        column
        for column in possible_target_columns
        if column in df.columns
    ),
    None,
)


if text_column is None:
    raise ValueError(
        "Unable to identify complaint text column. "
        "Expected complaint_text, training_text, or text."
    )

if priority_column is None:
    raise ValueError(
        "Unable to identify priority target column. "
        "Expected priority, priority_label, or label."
    )


print(
    f"\nDetected Text Column     : {text_column}"
)

print(
    f"Detected Priority Column : {priority_column}"
)


# =========================================================
# KEEP REQUIRED COLUMNS
# =========================================================

df = df[
    [
        text_column,
        priority_column,
    ]
].copy()

df = df.rename(
    columns={
        text_column: "complaint_text",
        priority_column: "priority",
    }
)


# =========================================================
# BASIC CLEANING
# =========================================================

df["complaint_text"] = (
    df["complaint_text"]
    .astype(str)
    .str.strip()
)

df["priority"] = (
    df["priority"]
    .astype(str)
    .str.strip()
    .str.lower()
)


# =========================================================
# MISSING VALUES
# =========================================================

print("\n" + "=" * 75)
print("MISSING VALUES")
print("=" * 75)

print(
    df.isna().sum()
)

empty_text_count = (
    df["complaint_text"]
    .eq("")
    .sum()
)

empty_priority_count = (
    df["priority"]
    .eq("")
    .sum()
)

print(
    f"\nEmpty complaint texts : {empty_text_count}"
)

print(
    f"Empty priority labels : {empty_priority_count}"
)


# =========================================================
# VALID PRIORITY LABELS
# =========================================================

print("\n" + "=" * 75)
print("PRIORITY LABEL VALIDATION")
print("=" * 75)

valid_priorities = {
    "low",
    "medium",
    "high",
}

unique_priorities = sorted(
    df["priority"].unique()
)

print(
    "\nUnique Priority Labels:"
)

print(
    unique_priorities
)

invalid_priorities = [
    priority
    for priority in unique_priorities
    if priority not in valid_priorities
]

if invalid_priorities:
    print(
        "\nWARNING: Invalid priority labels found:"
    )

    print(
        invalid_priorities
    )

else:
    print(
        "\nPASS: Only low, medium and high labels found."
    )


# =========================================================
# PRIORITY DISTRIBUTION
# =========================================================

print("\n" + "=" * 75)
print("PRIORITY DISTRIBUTION")
print("=" * 75)

priority_counts = (
    df["priority"]
    .value_counts()
    .sort_index()
)

print(
    priority_counts
)

print(
    "\nPriority Percentages:"
)

priority_percentages = (
    df["priority"]
    .value_counts(
        normalize=True
    )
    .mul(100)
    .sort_index()
)

for priority, percentage in (
    priority_percentages.items()
):
    print(
        f"{priority:10} : {percentage:.2f}%"
    )


# =========================================================
# EXACT DUPLICATES
# =========================================================

print("\n" + "=" * 75)
print("EXACT DUPLICATE COMPLAINTS")
print("=" * 75)

exact_duplicates = (
    df["complaint_text"]
    .duplicated(
        keep=False
    )
)

exact_duplicate_count = (
    df["complaint_text"]
    .duplicated()
    .sum()
)

print(
    f"\nExact duplicate complaint texts: "
    f"{exact_duplicate_count}"
)

if exact_duplicate_count > 0:

    print(
        "\nSample Exact Duplicates:"
    )

    print(
        df[
            exact_duplicates
        ]
        .sort_values(
            "complaint_text"
        )
        .head(20)
        .to_string(
            index=False
        )
    )


# =========================================================
# NORMALIZED DUPLICATES
# =========================================================

print("\n" + "=" * 75)
print("NORMALIZED DUPLICATES")
print("=" * 75)

df["normalized_text"] = (
    df["complaint_text"]
    .map(
        normalize_text
    )
)

normalized_duplicate_count = (
    df["normalized_text"]
    .duplicated()
    .sum()
)

print(
    f"\nNormalized duplicate texts: "
    f"{normalized_duplicate_count}"
)


# =========================================================
# CONFLICTING PRIORITY LABELS
# =========================================================

print("\n" + "=" * 75)
print("CONFLICTING PRIORITY LABELS")
print("=" * 75)

priority_conflicts = (
    df.groupby(
        "normalized_text"
    )["priority"]
    .nunique()
)

conflicting_texts = (
    priority_conflicts[
        priority_conflicts > 1
    ]
    .index
)

print(
    f"\nTexts appearing under multiple "
    f"priority labels: "
    f"{len(conflicting_texts)}"
)

if len(conflicting_texts) > 0:

    conflicts_df = (
        df[
            df[
                "normalized_text"
            ].isin(
                conflicting_texts
            )
        ]
        .sort_values(
            [
                "normalized_text",
                "priority",
            ]
        )
    )

    print(
        "\nSample Priority Conflicts:"
    )

    print(
        conflicts_df[
            [
                "complaint_text",
                "priority",
            ]
        ]
        .head(30)
        .to_string(
            index=False
        )
    )


# =========================================================
# UNIQUE TEXTS BY PRIORITY
# =========================================================

print("\n" + "=" * 75)
print("UNIQUE TEXTS BY PRIORITY")
print("=" * 75)

for priority in sorted(
    df["priority"].unique()
):

    subset = df[
        df["priority"]
        == priority
    ]

    total = len(
        subset
    )

    unique = (
        subset[
            "normalized_text"
        ]
        .nunique()
    )

    unique_ratio = (
        unique / total * 100
        if total > 0
        else 0
    )

    print(
        f"{priority:10} "
        f"Total: {total:5} | "
        f"Unique: {unique:5} | "
        f"Unique Ratio: "
        f"{unique_ratio:.2f}%"
    )


# =========================================================
# TEXT LENGTH
# =========================================================

print("\n" + "=" * 75)
print("TEXT LENGTH BY PRIORITY")
print("=" * 75)

df["word_count"] = (
    df["complaint_text"]
    .str.split()
    .str.len()
)

length_stats = (
    df.groupby(
        "priority"
    )["word_count"]
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

print(
    length_stats
)


# =========================================================
# POSSIBLE PRIORITY KEYWORD ANALYSIS
# =========================================================

print("\n" + "=" * 75)
print("PRIORITY KEYWORD INSPECTION")
print("=" * 75)

keyword_groups = {
    "high_risk": [
        "danger",
        "dangerous",
        "emergency",
        "urgent",
        "immediately",
        "live wire",
        "fallen wire",
        "fire",
        "explosion",
        "accident",
        "injury",
        "hospital",
        "school",
        "flooding",
        "severe",
    ],

    "medium_risk": [
        "blocked",
        "overflow",
        "not working",
        "outage",
        "leak",
        "damaged",
        "broken",
        "uncollected",
        "several days",
    ],

    "low_risk": [
        "dim",
        "minor",
        "small",
        "slight",
        "occasionally",
        "slow",
    ],
}


for group_name, keywords in (
    keyword_groups.items()
):

    print(
        f"\n--- {group_name.upper()} ---"
    )

    for keyword in keywords:

        mask = (
            df["complaint_text"]
            .str.lower()
            .str.contains(
                re.escape(keyword),
                na=False,
            )
        )

        matches = df[
            mask
        ]

        if len(matches) == 0:
            continue

        distribution = (
            matches["priority"]
            .value_counts()
            .to_dict()
        )

        print(
            f"{keyword:18} "
            f"Count: {len(matches):4} | "
            f"{distribution}"
        )


# =========================================================
# RANDOM SAMPLES BY PRIORITY
# =========================================================

print("\n" + "=" * 75)
print("RANDOM PRIORITY TRAINING EXAMPLES")
print("=" * 75)

for priority in sorted(
    df["priority"].unique()
):

    print(
        f"\n--- {priority.upper()} ---"
    )

    priority_df = (
        df[
            df["priority"]
            == priority
        ]
    )

    sample_size = min(
        15,
        len(priority_df),
    )

    samples = (
        priority_df
        .sample(
            n=sample_size,
            random_state=RANDOM_STATE,
        )
    )

    for number, complaint_text in enumerate(
        samples[
            "complaint_text"
        ],
        start=1,
    ):
        print(
            f"{number:02}. "
            f"{complaint_text}"
        )


# =========================================================
# SHORT / LONG RECORDS
# =========================================================

print("\n" + "=" * 75)
print("VERY SHORT COMPLAINTS")
print("=" * 75)

very_short = (
    df[
        df["word_count"] <= 5
    ]
)

print(
    f"\nComplaints with <= 5 words: "
    f"{len(very_short)}"
)

if len(very_short) > 0:

    print(
        very_short[
            [
                "complaint_text",
                "priority",
                "word_count",
            ]
        ]
        .head(30)
        .to_string(
            index=False
        )
    )


# =========================================================
# FINAL SUMMARY
# =========================================================

print("\n" + "=" * 75)
print("PRIORITY DATASET INSPECTION SUMMARY")
print("=" * 75)

print(
    f"\nTotal Records             : "
    f"{len(df)}"
)

print(
    f"Exact Duplicates          : "
    f"{exact_duplicate_count}"
)

print(
    f"Normalized Duplicates     : "
    f"{normalized_duplicate_count}"
)

print(
    f"Conflicting Labels        : "
    f"{len(conflicting_texts)}"
)

print(
    f"Priority Classes          : "
    f"{sorted(df['priority'].unique())}"
)

print(
    "\nInspection complete."
)