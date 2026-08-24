import pandas as pd
import re
from pathlib import Path
from collections import Counter

DATASET_PATH = Path(
    "../datasets/priority/priority_training_dataset_v2.csv"
)

print("=" * 70)
print("VALIDATING PRIORITY TRAINING DATASET")
print("=" * 70)

df = pd.read_csv(DATASET_PATH)

# =========================================================
# BASIC CHECKS
# =========================================================

print("\nDataset Shape:")
print(df.shape)

print("\nColumns:")
print(df.columns.tolist())

print("\nMissing Values:")
print(df.isnull().sum())

print("\nPriority Distribution:")
print(
    df["priority"]
    .value_counts()
    .sort_index()
)

# =========================================================
# DUPLICATES
# =========================================================

print("\nExact Duplicate Rows:")
print(df.duplicated().sum())

print("\nDuplicate Complaint Texts:")
print(
    df["complaint_text"]
    .duplicated()
    .sum()
)

# =========================================================
# TEXT LENGTH
# =========================================================

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
        [
            "complaint_text",
            "priority",
            "word_count",
        ]
    ]
    .head(10)
    .to_string(index=False)
)

print("\nLongest 10 Complaints:")
print(
    df.sort_values(
        "word_count",
        ascending=False,
    )[
        [
            "complaint_text",
            "priority",
            "word_count",
        ]
    ]
    .head(10)
    .to_string(index=False)
)

# =========================================================
# CROSS-PRIORITY TEXT COLLISIONS
# =========================================================

text_priority_counts = (
    df.groupby("complaint_text")["priority"]
    .nunique()
)

cross_priority = text_priority_counts[
    text_priority_counts > 1
]

print("\nTexts Appearing in Multiple Priorities:")
print(len(cross_priority))

# =========================================================
# TEMPLATE PREFIX REPETITION
# =========================================================

def get_prefix(text, words=5):
    tokens = str(text).lower().split()
    return " ".join(tokens[:words])


prefix_counts = Counter(
    df["complaint_text"]
    .apply(get_prefix)
)

print("\nMost Common 5-Word Prefixes:")

for prefix, count in prefix_counts.most_common(20):
    print(
        f"{count:4}  {prefix}"
    )

# =========================================================
# PRIORITY VOCABULARY
# =========================================================

stop_words = {
    "the",
    "a",
    "an",
    "is",
    "are",
    "to",
    "of",
    "and",
    "in",
    "on",
    "for",
    "with",
    "there",
    "this",
    "that",
    "please",
    "our",
    "we",
    "has",
    "have",
    "been",
    "near",
    "issue",
    "problem",
    "residents",
    "reported",
    "because",
}

print("\nTop Words by Priority:")

for priority in [
    "low",
    "medium",
    "high",
]:

    text = " ".join(
        df.loc[
            df["priority"] == priority,
            "complaint_text",
        ].astype(str)
    ).lower()

    words = re.findall(
        r"[a-zA-Z]+",
        text
    )

    words = [
        word
        for word in words
        if word not in stop_words
        and len(word) > 2
    ]

    counts = Counter(words)

    print(
        f"\n{priority.upper()}:"
    )

    print(
        counts.most_common(20)
    )

# =========================================================
# SEVERITY-LEAKAGE CHECKS
# =========================================================

high_severity_words = [
    "emergency",
    "urgent",
    "immediate",
    "danger",
    "dangerous",
    "severe",
    "toxic",
    "collapse",
    "collapsed",
    "sparking",
    "live wire",
    "serious safety risk",
]

low_severity_words = [
    "minor",
    "routine",
    "when possible",
    "normal inspection",
]

def contains_any(text, phrases):
    text = str(text).lower()

    return any(
        phrase in text
        for phrase in phrases
    )


df["contains_high_marker"] = (
    df["complaint_text"]
    .apply(
        lambda text:
        contains_any(
            text,
            high_severity_words
        )
    )
)

df["contains_low_marker"] = (
    df["complaint_text"]
    .apply(
        lambda text:
        contains_any(
            text,
            low_severity_words
        )
    )
)

print("\nHigh-Severity Markers by Priority:")
print(
    pd.crosstab(
        df["priority"],
        df["contains_high_marker"],
    )
)

print("\nLow-Severity Markers by Priority:")
print(
    pd.crosstab(
        df["priority"],
        df["contains_low_marker"],
    )
)

# =========================================================
# POTENTIAL TEMPLATE LEAKAGE
# =========================================================

template_markers = [
    "Immediate action is required.",
    "This is creating a serious safety risk.",
    "Please send an emergency response team.",
    "Urgent intervention is required.",
    "The issue is minor but should be checked.",
    "This appears to need routine maintenance.",
    "Please arrange a normal inspection.",
    "Please take action soon.",
    "Residents are requesting prompt attention.",
]

print("\nTemplate Marker Counts:")

for marker in template_markers:

    count = (
        df["complaint_text"]
        .astype(str)
        .str.contains(
            re.escape(marker),
            case=False,
            regex=True,
            na=False,
        )
        .sum()
    )

    print(
        f"{count:4}  {marker}"
    )

# =========================================================
# FINAL SUMMARY
# =========================================================

print("\n" + "=" * 70)
print("PRIORITY DATASET VALIDATION SUMMARY")
print("=" * 70)

print(
    f"Rows: {len(df)}"
)

print(
    f"Unique complaint texts: "
    f"{df['complaint_text'].nunique()}"
)

print(
    f"Exact duplicate rows: "
    f"{df.duplicated().sum()}"
)

print(
    f"Duplicate complaint texts: "
    f"{df['complaint_text'].duplicated().sum()}"
)

print(
    f"Cross-priority duplicate texts: "
    f"{len(cross_priority)}"
)