import pandas as pd
import re
from pathlib import Path
from collections import Counter

DATASET_PATH = Path("../datasets/final_complaint_training_dataset_v2.csv")

print("=" * 70)
print("VALIDATING FINAL TRAINING DATASET")
print("=" * 70)

df = pd.read_csv(DATASET_PATH)

# ---------------------------------------------------------
# BASIC CHECKS
# ---------------------------------------------------------

print("\nDataset Shape:")
print(df.shape)

print("\nColumns:")
print(df.columns.tolist())

print("\nMissing Values:")
print(df.isnull().sum())

print("\nCategory Distribution:")
print(df["category"].value_counts().sort_index())

print("\nLanguage Distribution:")
print(df["language"].value_counts())

# ---------------------------------------------------------
# DUPLICATES
# ---------------------------------------------------------

print("\nExact Duplicate Rows:")
print(df.duplicated().sum())

print("\nDuplicate Complaint Texts:")
print(df["complaint_text"].duplicated().sum())

# ---------------------------------------------------------
# TEXT LENGTH
# ---------------------------------------------------------

df["word_count"] = (
    df["complaint_text"]
    .astype(str)
    .str.split()
    .str.len()
)

print("\nComplaint Text Word Count Statistics:")
print(df["word_count"].describe())

print("\nShortest 10 Complaints:")
print(
    df.sort_values("word_count")[
        ["complaint_text", "category", "word_count"]
    ]
    .head(10)
    .to_string(index=False)
)

print("\nLongest 10 Complaints:")
print(
    df.sort_values("word_count", ascending=False)[
        ["complaint_text", "category", "word_count"]
    ]
    .head(10)
    .to_string(index=False)
)

# ---------------------------------------------------------
# SUSPICIOUS / TECHNICAL TEXT PATTERNS
# ---------------------------------------------------------

technical_patterns = [
    r"\bWLWP\b",
    r"\bWA\d+\b",
    r"\bSA\d*\b",
    r"\bQA\d+\b",
    r"\bHD\d+\b",
    r"\bHQL\b",
    r"\bHQS\b",
    r"\bHC\d+\b",
    r"\bE\d+[A-Z]?\b",
    r"\b\d+R[A-Z]?\b",
]

technical_regex = re.compile(
    "|".join(technical_patterns),
    flags=re.IGNORECASE
)

technical_rows = df[
    df["complaint_text"]
    .astype(str)
    .str.contains(technical_regex, na=False)
]

print("\nPotential Technical-Code Complaints:")
print(len(technical_rows))

if len(technical_rows) > 0:
    print(
        technical_rows[
            ["complaint_text", "category"]
        ]
        .head(20)
        .to_string(index=False)
    )

# ---------------------------------------------------------
# AWKWARD TEMPLATE PATTERNS
# ---------------------------------------------------------

awkward_patterns = [
    r"There is:",
    r"I am reporting:",
    r"We have noticed:",
    r"There has been:",
    r"Our area has:",
]

awkward_regex = re.compile(
    "|".join(awkward_patterns),
    flags=re.IGNORECASE
)

awkward_rows = df[
    df["complaint_text"]
    .astype(str)
    .str.contains(awkward_regex, na=False)
]

print("\nPotential Awkward Template Complaints:")
print(len(awkward_rows))

if len(awkward_rows) > 0:
    print(
        awkward_rows[
            ["complaint_text", "category"]
        ]
        .head(20)
        .to_string(index=False)
    )

# ---------------------------------------------------------
# PREFIX REPETITION
# ---------------------------------------------------------

def get_prefix(text, words=4):
    tokens = str(text).lower().split()
    return " ".join(tokens[:words])

prefix_counts = Counter(
    df["complaint_text"].apply(get_prefix)
)

print("\nMost Common 4-Word Prefixes:")
for prefix, count in prefix_counts.most_common(20):
    print(f"{count:4}  {prefix}")

# ---------------------------------------------------------
# CROSS-CATEGORY TEXT COLLISIONS
# ---------------------------------------------------------

text_category_counts = (
    df.groupby("complaint_text")["category"]
    .nunique()
)

cross_category = text_category_counts[
    text_category_counts > 1
]

print("\nTexts Appearing in Multiple Categories:")
print(len(cross_category))

# ---------------------------------------------------------
# CATEGORY VOCABULARY
# ---------------------------------------------------------

print("\nTop Words by Category:")

stop_words = {
    "the", "a", "an", "is", "are", "to", "of",
    "and", "in", "on", "for", "with", "there",
    "this", "that", "please", "our", "we",
    "has", "have", "been", "near", "issue",
    "problem", "area", "reported", "residents",
}

for category in sorted(df["category"].unique()):

    text = " ".join(
        df.loc[
            df["category"] == category,
            "complaint_text"
        ].astype(str)
    ).lower()

    words = re.findall(r"[a-zA-Z]+", text)

    words = [
        word
        for word in words
        if word not in stop_words
        and len(word) > 2
    ]

    counts = Counter(words)

    print(f"\n{category}:")
    print(counts.most_common(15))

# ---------------------------------------------------------
# FINAL SUMMARY
# ---------------------------------------------------------

print("\n" + "=" * 70)
print("VALIDATION SUMMARY")
print("=" * 70)

print(f"Rows: {len(df)}")
print(f"Unique complaint texts: {df['complaint_text'].nunique()}")
print(f"Exact duplicate rows: {df.duplicated().sum()}")
print(f"Technical-code rows: {len(technical_rows)}")
print(f"Awkward-template rows: {len(awkward_rows)}")
print(f"Cross-category duplicate texts: {len(cross_category)}")