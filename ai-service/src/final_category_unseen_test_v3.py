import pandas as pd
from pathlib import Path

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC

from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    classification_report,
    confusion_matrix,
)


# =========================================================
# PATHS
# =========================================================

TRAIN_DATASET = Path(
    "../datasets/final_complaint_training_dataset_v3.csv"
)

TEST_DATASET = Path(
    "../datasets/manual_unseen_test_dataset.csv"
)

RANDOM_STATE = 42


# =========================================================
# LOAD DATA
# =========================================================

print("=" * 75)
print("FINAL CATEGORY MODEL - INDEPENDENT UNSEEN TEST")
print("=" * 75)

train_df = pd.read_csv(TRAIN_DATASET)
test_df = pd.read_csv(TEST_DATASET)

train_df = train_df[
    ["complaint_text", "category"]
].dropna()

test_df = test_df[
    ["complaint_text", "category"]
].dropna()

train_df["complaint_text"] = (
    train_df["complaint_text"]
    .astype(str)
    .str.strip()
)

train_df["category"] = (
    train_df["category"]
    .astype(str)
    .str.strip()
)

test_df["complaint_text"] = (
    test_df["complaint_text"]
    .astype(str)
    .str.strip()
)

test_df["category"] = (
    test_df["category"]
    .astype(str)
    .str.strip()
)


print(
    f"\nTraining Dataset Shape : {train_df.shape}"
)

print(
    f"Unseen Test Shape      : {test_df.shape}"
)


# =========================================================
# LEAKAGE CHECK
# =========================================================

print("\n" + "=" * 75)
print("TRAIN / TEST LEAKAGE CHECK")
print("=" * 75)

train_texts = set(
    train_df["complaint_text"]
    .str.lower()
    .str.strip()
)

test_texts = set(
    test_df["complaint_text"]
    .str.lower()
    .str.strip()
)

overlap = train_texts.intersection(
    test_texts
)

print(
    f"\nExact Text Overlap : {len(overlap)}"
)

if len(overlap) == 0:
    print(
        "\nPASS: No exact complaint text "
        "overlap detected."
    )
else:
    print(
        "\nWARNING: Exact train/test "
        "overlap detected."
    )


# =========================================================
# INPUT / TARGET
# =========================================================

X_train = train_df["complaint_text"]
y_train = train_df["category"]

X_test = test_df["complaint_text"]
y_test = test_df["category"]


# =========================================================
# FINAL TUNED MODEL
# =========================================================

print("\n" + "=" * 75)
print("FINAL TUNED MODEL CONFIGURATION")
print("=" * 75)

print(
    "\nModel        : TF-IDF + Linear SVM"
)

print(
    "C            : 0.5"
)

print(
    "N-gram Range : (1, 1)"
)

print(
    "min_df       : 1"
)

print(
    "max_df       : 0.95"
)

print(
    "max_features : None"
)


model = Pipeline(
    [
        (
            "tfidf",
            TfidfVectorizer(
                lowercase=True,
                strip_accents="unicode",
                sublinear_tf=True,
                ngram_range=(1, 1),
                min_df=1,
                max_df=0.95,
                max_features=None,
            ),
        ),
        (
            "classifier",
            LinearSVC(
                C=0.5,
                random_state=RANDOM_STATE,
            ),
        ),
    ]
)


# =========================================================
# TRAIN FINAL CONFIGURATION
# =========================================================

print("\n" + "=" * 75)
print("TRAINING FINAL CONFIGURATION")
print("=" * 75)

model.fit(
    X_train,
    y_train,
)

print(
    "\nTraining completed successfully."
)


# =========================================================
# PREDICT INDEPENDENT TEST DATA
# =========================================================

predictions = model.predict(
    X_test
)


# =========================================================
# METRICS
# =========================================================

accuracy = accuracy_score(
    y_test,
    predictions,
)

precision, recall, f1, _ = (
    precision_recall_fscore_support(
        y_test,
        predictions,
        average="macro",
        zero_division=0,
    )
)


print("\n" + "=" * 75)
print("FINAL INDEPENDENT UNSEEN RESULTS")
print("=" * 75)

print(
    f"\nAccuracy        : {accuracy:.4f}"
)

print(
    f"Macro Precision : {precision:.4f}"
)

print(
    f"Macro Recall    : {recall:.4f}"
)

print(
    f"Macro F1        : {f1:.4f}"
)


# =========================================================
# CLASSIFICATION REPORT
# =========================================================

print(
    "\nClassification Report:"
)

print(
    classification_report(
        y_test,
        predictions,
        digits=4,
        zero_division=0,
    )
)


# =========================================================
# CONFUSION MATRIX
# =========================================================

labels = sorted(
    y_test.unique()
)

matrix = confusion_matrix(
    y_test,
    predictions,
    labels=labels,
)

matrix_df = pd.DataFrame(
    matrix,
    index=labels,
    columns=labels,
)

print(
    "\nConfusion Matrix:"
)

print(
    matrix_df
)


# =========================================================
# ERROR ANALYSIS
# =========================================================

error_df = pd.DataFrame(
    {
        "complaint_text":
            X_test.values,

        "actual":
            y_test.values,

        "predicted":
            predictions,
    }
)

errors = error_df[
    error_df["actual"]
    != error_df["predicted"]
]


print(
    f"\nMisclassified Records : "
    f"{len(errors)}"
)


if len(errors) > 0:

    print(
        "\nMisclassified Complaints:"
    )

    print(
        errors.to_string(
            index=False
        )
    )


# =========================================================
# MISCLASSIFICATION PAIRS
# =========================================================

if len(errors) > 0:

    error_pairs = (
        errors
        .groupby(
            [
                "actual",
                "predicted",
            ]
        )
        .size()
        .reset_index(
            name="count"
        )
        .sort_values(
            by="count",
            ascending=False,
        )
    )

    print(
        "\nMost Common "
        "Misclassification Pairs:"
    )

    print(
        error_pairs.to_string(
            index=False
        )
    )


# =========================================================
# BASELINE COMPARISON
# =========================================================

V2_ACCURACY = 0.8500
V2_MACRO_F1 = 0.8517
V2_ERRORS = 45


print("\n" + "=" * 75)
print("V2 BASELINE VS FINAL V3")
print("=" * 75)

print(
    "\nV2 Baseline:"
)

print(
    f"Accuracy : {V2_ACCURACY:.4f}"
)

print(
    f"Macro F1 : {V2_MACRO_F1:.4f}"
)

print(
    f"Errors   : {V2_ERRORS}"
)


print(
    "\nFinal Tuned V3:"
)

print(
    f"Accuracy : {accuracy:.4f}"
)

print(
    f"Macro F1 : {f1:.4f}"
)

print(
    f"Errors   : {len(errors)}"
)


print(
    "\nImprovement:"
)

print(
    f"Accuracy Change : "
    f"{accuracy - V2_ACCURACY:+.4f}"
)

print(
    f"Macro F1 Change : "
    f"{f1 - V2_MACRO_F1:+.4f}"
)

print(
    f"Errors Reduced  : "
    f"{V2_ERRORS - len(errors):+d}"
)


# =========================================================
# FINAL DECISION
# =========================================================

print("\n" + "=" * 75)
print("FINAL MODEL DECISION")
print("=" * 75)

if (
    accuracy >= 0.95
    and f1 >= 0.95
):

    print(
        "\nPASS:"
    )

    print(
        "The tuned V3 category classifier "
        "achieved strong performance on the "
        "independent unseen dataset."
    )

else:

    print(
        "\nREVIEW REQUIRED:"
    )

    print(
        "The final model requires additional "
        "error analysis before production use."
    )


print(
    "\nThe independent unseen dataset "
    "was not used for model training."
)