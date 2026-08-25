from pathlib import Path

import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.naive_bayes import MultinomialNB

from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    classification_report,
    confusion_matrix,
    recall_score,
)


# =========================================================
# CONFIGURATION
# =========================================================

CURRENT_DIR = Path(__file__).resolve().parent
AI_SERVICE_DIR = CURRENT_DIR.parent

PRIORITY_DATA_DIR = (
    AI_SERVICE_DIR
    / "datasets"
    / "priority"
)

TRAIN_DATASET = (
    PRIORITY_DATA_DIR
    / "priority_training_dataset_v3.csv"
)

FINAL_BLIND_DATASET = (
    PRIORITY_DATA_DIR
    / "final_blind_priority_test_dataset.csv"
)


# =========================================================
# LOAD DATA
# =========================================================

print("=" * 75)
print("FINAL BLIND PRIORITY EVALUATION")
print("=" * 75)

if not TRAIN_DATASET.exists():
    raise FileNotFoundError(
        f"Training dataset not found:\n"
        f"{TRAIN_DATASET}"
    )

if not FINAL_BLIND_DATASET.exists():
    raise FileNotFoundError(
        f"Final blind dataset not found:\n"
        f"{FINAL_BLIND_DATASET}"
    )


train_df = pd.read_csv(
    TRAIN_DATASET
)

blind_df = pd.read_csv(
    FINAL_BLIND_DATASET
)


# =========================================================
# VALIDATE COLUMNS
# =========================================================

required_columns = {
    "complaint_text",
    "priority",
}

if not required_columns.issubset(
    train_df.columns
):
    raise ValueError(
        "Training dataset is missing "
        "required columns."
    )

if not required_columns.issubset(
    blind_df.columns
):
    raise ValueError(
        "Blind dataset is missing "
        "required columns."
    )


# =========================================================
# CLEAN DATA
# =========================================================

train_df = (
    train_df[
        [
            "complaint_text",
            "priority",
        ]
    ]
    .dropna()
    .copy()
)

blind_df = (
    blind_df[
        [
            "complaint_text",
            "priority",
        ]
    ]
    .dropna()
    .copy()
)


for dataframe in [
    train_df,
    blind_df,
]:
    dataframe["complaint_text"] = (
        dataframe["complaint_text"]
        .astype(str)
        .str.strip()
    )

    dataframe["priority"] = (
        dataframe["priority"]
        .astype(str)
        .str.strip()
        .str.lower()
    )


# =========================================================
# DATASET INFORMATION
# =========================================================

print(
    f"\nTraining Dataset Shape : "
    f"{train_df.shape}"
)

print(
    f"Blind Dataset Shape    : "
    f"{blind_df.shape}"
)


print(
    "\nTraining Distribution:"
)

print(
    train_df["priority"]
    .value_counts()
    .sort_index()
)


print(
    "\nBlind Distribution:"
)

print(
    blind_df["priority"]
    .value_counts()
    .sort_index()
)


# =========================================================
# LEAKAGE CHECK
# =========================================================

print("\n" + "=" * 75)
print("FINAL LEAKAGE CHECK")
print("=" * 75)


train_texts = set(
    train_df["complaint_text"]
    .str.lower()
    .str.strip()
)

blind_texts = set(
    blind_df["complaint_text"]
    .str.lower()
    .str.strip()
)

overlap = (
    train_texts
    & blind_texts
)

print(
    f"\nExact Text Overlap : "
    f"{len(overlap)}"
)


if len(overlap) > 0:
    raise ValueError(
        "Final blind evaluation stopped "
        "because train/blind overlap was found."
    )


print(
    "\nPASS: No exact train/blind overlap."
)


# =========================================================
# INPUT / TARGET
# =========================================================

X_train = (
    train_df["complaint_text"]
)

y_train = (
    train_df["priority"]
)

X_blind = (
    blind_df["complaint_text"]
)

y_blind = (
    blind_df["priority"]
)


# =========================================================
# FINAL SELECTED MODEL
# =========================================================

print("\n" + "=" * 75)
print("FINAL SELECTED PRIORITY MODEL")
print("=" * 75)

print(
    "\nModel      : TF-IDF + Multinomial Naive Bayes"
)

print(
    "Selection  : Safety-aware finalist comparison"
)

print(
    "Training   : Priority V3 (4500 records)"
)


model = Pipeline(
    [
        (
            "tfidf",
            TfidfVectorizer(
                lowercase=True,
                stop_words="english",
                ngram_range=(1, 2),
                min_df=2,
                max_df=0.95,
                sublinear_tf=True,
            ),
        ),

        (
            "classifier",
            MultinomialNB(),
        ),
    ]
)


# =========================================================
# TRAIN
# =========================================================

print("\n" + "=" * 75)
print("TRAINING FINAL SELECTED MODEL")
print("=" * 75)

model.fit(
    X_train,
    y_train,
)

print(
    "\nTraining completed successfully."
)


# =========================================================
# FINAL BLIND PREDICTIONS
# =========================================================

predictions = model.predict(
    X_blind
)


# =========================================================
# METRICS
# =========================================================

accuracy = accuracy_score(
    y_blind,
    predictions,
)

(
    macro_precision,
    macro_recall,
    macro_f1,
    _,
) = precision_recall_fscore_support(
    y_blind,
    predictions,
    average="macro",
    zero_division=0,
)


high_recall = recall_score(
    y_blind,
    predictions,
    labels=["high"],
    average="macro",
    zero_division=0,
)

medium_recall = recall_score(
    y_blind,
    predictions,
    labels=["medium"],
    average="macro",
    zero_division=0,
)

low_recall = recall_score(
    y_blind,
    predictions,
    labels=["low"],
    average="macro",
    zero_division=0,
)


# =========================================================
# RESULTS
# =========================================================

print("\n" + "=" * 75)
print("FINAL BLIND RESULTS")
print("=" * 75)


print(
    f"\nAccuracy        : "
    f"{accuracy:.4f}"
)

print(
    f"Macro Precision : "
    f"{macro_precision:.4f}"
)

print(
    f"Macro Recall    : "
    f"{macro_recall:.4f}"
)

print(
    f"Macro F1        : "
    f"{macro_f1:.4f}"
)

print(
    f"\nLow Recall      : "
    f"{low_recall:.4f}"
)

print(
    f"Medium Recall   : "
    f"{medium_recall:.4f}"
)

print(
    f"High Recall     : "
    f"{high_recall:.4f}"
)


# =========================================================
# CLASSIFICATION REPORT
# =========================================================

print(
    "\nClassification Report:"
)

print(
    classification_report(
        y_blind,
        predictions,
        labels=[
            "low",
            "medium",
            "high",
        ],
        digits=4,
        zero_division=0,
    )
)


# =========================================================
# CONFUSION MATRIX
# =========================================================

labels = [
    "low",
    "medium",
    "high",
]

matrix = confusion_matrix(
    y_blind,
    predictions,
    labels=labels,
)

matrix_df = pd.DataFrame(
    matrix,
    index=labels,
    columns=labels,
)


print(
    "Confusion Matrix:"
)

print(
    matrix_df.to_string()
)


# =========================================================
# ERROR ANALYSIS
# =========================================================

error_df = pd.DataFrame(
    {
        "complaint_text":
            X_blind.values,

        "actual":
            y_blind.values,

        "predicted":
            predictions,
    }
)


errors = (
    error_df[
        error_df["actual"]
        != error_df["predicted"]
    ]
    .copy()
)


print(
    f"\nMisclassified Records : "
    f"{len(errors)}"
)


# =========================================================
# SEVERITY ERROR COUNTS
# =========================================================

def count_pair(
    actual_label,
    predicted_label,
):
    return len(
        errors[
            (
                errors["actual"]
                == actual_label
            )
            &
            (
                errors["predicted"]
                == predicted_label
            )
        ]
    )


high_to_low = count_pair(
    "high",
    "low",
)

high_to_medium = count_pair(
    "high",
    "medium",
)

medium_to_low = count_pair(
    "medium",
    "low",
)

medium_to_high = count_pair(
    "medium",
    "high",
)

low_to_medium = count_pair(
    "low",
    "medium",
)

low_to_high = count_pair(
    "low",
    "high",
)


print(
    "\nSeverity Error Summary:"
)

print(
    f"High   -> Low    : "
    f"{high_to_low}"
)

print(
    f"High   -> Medium : "
    f"{high_to_medium}"
)

print(
    f"Medium -> Low    : "
    f"{medium_to_low}"
)

print(
    f"Medium -> High   : "
    f"{medium_to_high}"
)

print(
    f"Low    -> Medium : "
    f"{low_to_medium}"
)

print(
    f"Low    -> High   : "
    f"{low_to_high}"
)


# =========================================================
# HIGH PRIORITY ERRORS
# =========================================================

high_errors = (
    errors[
        errors["actual"]
        == "high"
    ]
)


print("\n" + "=" * 75)
print("HIGH PRIORITY BLIND ERRORS")
print("=" * 75)


if len(high_errors) == 0:

    print(
        "\nNone"
    )

else:

    print(
        "\n"
        + high_errors.to_string(
            index=False
        )
    )


# =========================================================
# ALL ERRORS
# =========================================================

print("\n" + "=" * 75)
print("ALL FINAL BLIND ERRORS")
print("=" * 75)


if len(errors) == 0:

    print(
        "\nNone"
    )

else:

    print(
        "\n"
        + errors.to_string(
            index=False
        )
    )


# =========================================================
# FINAL SAFETY CHECK
# =========================================================

print("\n" + "=" * 75)
print("FINAL BLIND SAFETY CHECK")
print("=" * 75)


if high_to_low == 0:

    print(
        "\nPASS:"
    )

    print(
        "No High -> Low errors occurred "
        "on the final blind dataset."
    )

else:

    print(
        "\nWARNING:"
    )

    print(
        f"{high_to_low} High -> Low "
        f"error(s) occurred."
    )


# =========================================================
# FINAL DECISION
# =========================================================

print("\n" + "=" * 75)
print("FINAL BLIND MODEL DECISION")
print("=" * 75)


if (
    accuracy >= 0.90
    and
    macro_f1 >= 0.90
    and
    high_recall >= 0.90
    and
    high_to_low == 0
):

    print(
        "\nPASS:"
    )

    print(
        "The selected priority model achieved "
        "strong performance on the final blind "
        "evaluation dataset."
    )

    print(
        "The model can proceed to production "
        "training and integration."
    )

else:

    print(
        "\nREVIEW REQUIRED:"
    )

    print(
        "The final blind result did not meet "
        "all predefined performance criteria."
    )

    print(
        "Do not tune using this blind dataset."
    )


# =========================================================
# FINAL SUMMARY
# =========================================================

print("\n" + "=" * 75)
print("FINAL BLIND PRIORITY SUMMARY")
print("=" * 75)


print(
    f"\nModel            : "
    f"Multinomial Naive Bayes"
)

print(
    f"Training Records : "
    f"{len(train_df)}"
)

print(
    f"Blind Records    : "
    f"{len(blind_df)}"
)

print(
    f"Accuracy         : "
    f"{accuracy:.4f}"
)

print(
    f"Macro F1         : "
    f"{macro_f1:.4f}"
)

print(
    f"High Recall      : "
    f"{high_recall:.4f}"
)

print(
    f"Errors           : "
    f"{len(errors)}"
)

print(
    f"High -> Low      : "
    f"{high_to_low}"
)


print(
    "\nIMPORTANT:"
)

print(
    "Treat this as the final blind evaluation."
)

print(
    "Do not modify the V3 training dataset, "
    "model choice, or blind dataset based on "
    "individual errors from this result."
)