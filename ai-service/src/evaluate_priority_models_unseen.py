import pandas as pd
from pathlib import Path

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline

from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.naive_bayes import MultinomialNB

from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    classification_report,
    confusion_matrix,
)


# =========================================================
# CONFIGURATION
# =========================================================

RANDOM_STATE = 42

# Previous independent V2 baseline
V2_BASELINE_ACCURACY = 0.8933
V2_BASELINE_MACRO_F1 = 0.8929
V2_BASELINE_ERRORS = 16


# =========================================================
# PATHS
# =========================================================

CURRENT_DIR = Path(__file__).resolve().parent
AI_SERVICE_DIR = CURRENT_DIR.parent

PRIORITY_DATA_DIR = (
    AI_SERVICE_DIR
    / "datasets"
    / "priority"
)

# IMPORTANT:
# V3 is now the training dataset.
TRAIN_DATASET = (
    PRIORITY_DATA_DIR
    / "priority_training_dataset_v3.csv"
)

# IMPORTANT:
# Keep the same independent unseen dataset.
TEST_DATASET = (
    PRIORITY_DATA_DIR
    / "manual_unseen_priority_test_dataset.csv"
)


# =========================================================
# START
# =========================================================

print("=" * 75)
print("INDEPENDENT UNSEEN PRIORITY MODEL EVALUATION - V3")
print("=" * 75)

print(
    f"\nTraining Dataset:\n"
    f"{TRAIN_DATASET}"
)

print(
    f"\nIndependent Test Dataset:\n"
    f"{TEST_DATASET}"
)


# =========================================================
# FILE VALIDATION
# =========================================================

if not TRAIN_DATASET.exists():
    raise FileNotFoundError(
        f"Training dataset not found:\n"
        f"{TRAIN_DATASET}"
    )

if not TEST_DATASET.exists():
    raise FileNotFoundError(
        f"Unseen test dataset not found:\n"
        f"{TEST_DATASET}"
    )


# =========================================================
# LOAD DATA
# =========================================================

train_df = pd.read_csv(
    TRAIN_DATASET
)

test_df = pd.read_csv(
    TEST_DATASET
)


# =========================================================
# VALIDATE COLUMNS
# =========================================================

required_columns = {
    "complaint_text",
    "priority",
}

missing_train_columns = (
    required_columns
    - set(train_df.columns)
)

missing_test_columns = (
    required_columns
    - set(test_df.columns)
)


if missing_train_columns:
    raise ValueError(
        "Training dataset missing columns: "
        f"{sorted(missing_train_columns)}"
    )


if missing_test_columns:
    raise ValueError(
        "Test dataset missing columns: "
        f"{sorted(missing_test_columns)}"
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

test_df = (
    test_df[
        [
            "complaint_text",
            "priority",
        ]
    ]
    .dropna()
    .copy()
)


train_df["complaint_text"] = (
    train_df["complaint_text"]
    .astype(str)
    .str.strip()
)

train_df["priority"] = (
    train_df["priority"]
    .astype(str)
    .str.strip()
    .str.lower()
)


test_df["complaint_text"] = (
    test_df["complaint_text"]
    .astype(str)
    .str.strip()
)

test_df["priority"] = (
    test_df["priority"]
    .astype(str)
    .str.strip()
    .str.lower()
)


# =========================================================
# REMOVE EMPTY RECORDS
# =========================================================

train_df = train_df[
    train_df["complaint_text"].str.len() > 0
].copy()

test_df = test_df[
    test_df["complaint_text"].str.len() > 0
].copy()


# =========================================================
# LABEL VALIDATION
# =========================================================

expected_priorities = {
    "low",
    "medium",
    "high",
}

train_priorities = set(
    train_df["priority"].unique()
)

test_priorities = set(
    test_df["priority"].unique()
)


if train_priorities != expected_priorities:
    raise ValueError(
        "Unexpected training priority labels. "
        f"Found: {sorted(train_priorities)}"
    )


if test_priorities != expected_priorities:
    raise ValueError(
        "Unexpected unseen-test priority labels. "
        f"Found: {sorted(test_priorities)}"
    )


# =========================================================
# DATASET INFORMATION
# =========================================================

print("\n" + "=" * 75)
print("DATASET INFORMATION")
print("=" * 75)

print(
    f"\nTraining Dataset Shape : "
    f"{train_df.shape}"
)

print(
    f"Unseen Test Shape      : "
    f"{test_df.shape}"
)


print("\nTraining Distribution:")

print(
    train_df["priority"]
    .value_counts()
    .sort_index()
)


print("\nUnseen Test Distribution:")

print(
    test_df["priority"]
    .value_counts()
    .sort_index()
)


# =========================================================
# TRAINING BALANCE CHECK
# =========================================================

print("\n" + "=" * 75)
print("TRAINING CLASS BALANCE CHECK")
print("=" * 75)

training_distribution = (
    train_df["priority"]
    .value_counts()
)

if (
    training_distribution.min()
    == training_distribution.max()
):
    print(
        "\nPASS: V3 training classes are "
        "perfectly balanced."
    )

else:
    print(
        "\nWARNING: V3 training classes are "
        "not perfectly balanced."
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


overlap = (
    train_texts
    & test_texts
)


print(
    f"\nExact Text Overlap : "
    f"{len(overlap)}"
)


if len(overlap) == 0:

    print(
        "\nPASS: No exact complaint text "
        "overlap detected."
    )

else:

    print(
        "\nWARNING: Exact text overlap detected."
    )

    print(
        "\nFirst overlapping examples:"
    )

    for text in list(overlap)[:20]:
        print(
            f"- {text}"
        )


# =========================================================
# IMPORTANT LEAKAGE SAFETY
# =========================================================

if len(overlap) > 0:
    raise ValueError(
        "Evaluation stopped because training/test "
        "text overlap was detected."
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

X_test = (
    test_df["complaint_text"]
)

y_test = (
    test_df["priority"]
)


# =========================================================
# MODELS
# =========================================================

models = {

    "Logistic Regression":
        LogisticRegression(
            max_iter=3000,
            random_state=RANDOM_STATE,
        ),

    "Linear SVM":
        LinearSVC(
            random_state=RANDOM_STATE,
        ),

    "Multinomial Naive Bayes":
        MultinomialNB(),
}


# =========================================================
# STORAGE
# =========================================================

results = []

trained_models = {}

error_tables = {}


# =========================================================
# PRIORITY ORDER
# =========================================================

labels = [
    "low",
    "medium",
    "high",
]


# =========================================================
# TRAIN + EVALUATE
# =========================================================

for model_name, classifier in models.items():

    print(
        "\n" + "=" * 75
    )

    print(
        model_name.upper()
    )

    print(
        "=" * 75
    )


    # -----------------------------------------------------
    # PIPELINE
    # -----------------------------------------------------

    pipeline = Pipeline(
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
                classifier,
            ),
        ]
    )


    # -----------------------------------------------------
    # TRAIN
    # -----------------------------------------------------

    pipeline.fit(
        X_train,
        y_train,
    )


    # -----------------------------------------------------
    # PREDICT
    # -----------------------------------------------------

    predictions = pipeline.predict(
        X_test
    )


    # -----------------------------------------------------
    # METRICS
    # -----------------------------------------------------

    accuracy = accuracy_score(
        y_test,
        predictions,
    )

    (
        precision,
        recall,
        f1,
        _,
    ) = precision_recall_fscore_support(
        y_test,
        predictions,
        average="macro",
        zero_division=0,
    )


    print(
        f"\nAccuracy        : "
        f"{accuracy:.4f}"
    )

    print(
        f"Macro Precision : "
        f"{precision:.4f}"
    )

    print(
        f"Macro Recall    : "
        f"{recall:.4f}"
    )

    print(
        f"Macro F1-Score  : "
        f"{f1:.4f}"
    )


    # -----------------------------------------------------
    # CLASSIFICATION REPORT
    # -----------------------------------------------------

    print(
        "\nClassification Report:"
    )

    print(
        classification_report(
            y_test,
            predictions,
            labels=labels,
            digits=4,
            zero_division=0,
        )
    )


    # -----------------------------------------------------
    # CONFUSION MATRIX
    # -----------------------------------------------------

    matrix = confusion_matrix(
        y_test,
        predictions,
        labels=labels,
    )

    confusion_df = pd.DataFrame(
        matrix,
        index=labels,
        columns=labels,
    )

    print(
        "Confusion Matrix:"
    )

    print(
        confusion_df.to_string()
    )


    # -----------------------------------------------------
    # ERROR TABLE
    # -----------------------------------------------------

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


    errors = (
        error_df[
            error_df["actual"]
            != error_df["predicted"]
        ]
        .copy()
    )


    print(
        f"\nMisclassified Records: "
        f"{len(errors)}"
    )


    if len(errors) > 0:

        print(
            "\nMisclassified Examples:"
        )

        print(
            errors
            .head(50)
            .to_string(
                index=False
            )
        )


    # -----------------------------------------------------
    # MISCLASSIFICATION PAIRS
    # -----------------------------------------------------

    if len(errors) > 0:

        confusion_pairs = (
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
                "count",
                ascending=False,
            )
        )

        print(
            "\nMost Common "
            "Misclassification Pairs:"
        )

        print(
            confusion_pairs
            .to_string(
                index=False
            )
        )


    # -----------------------------------------------------
    # SEVERITY-SPECIFIC ERRORS
    # -----------------------------------------------------

    print(
        "\nSeverity Error Summary:"
    )

    severity_pairs = [
        ("high", "medium"),
        ("high", "low"),
        ("medium", "high"),
        ("medium", "low"),
        ("low", "medium"),
        ("low", "high"),
    ]


    severity_counts = {}

    for (
        actual_label,
        predicted_label,
    ) in severity_pairs:

        count = len(
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

        severity_counts[
            (
                actual_label,
                predicted_label,
            )
        ] = count

        print(
            f"{actual_label:6} -> "
            f"{predicted_label:6} : "
            f"{count}"
        )


    # -----------------------------------------------------
    # CRITICAL UNDER-PRIORITIZATION
    # -----------------------------------------------------

    critical_underprioritization = (
        severity_counts[
            ("high", "low")
        ]
    )

    high_to_medium = (
        severity_counts[
            ("high", "medium")
        ]
    )


    print(
        "\nSafety-Sensitive Errors:"
    )

    print(
        f"High -> Low    : "
        f"{critical_underprioritization}"
    )

    print(
        f"High -> Medium : "
        f"{high_to_medium}"
    )


    # -----------------------------------------------------
    # SAVE RESULT
    # -----------------------------------------------------

    results.append(
        {
            "Model":
                model_name,

            "Accuracy":
                accuracy,

            "Macro_Precision":
                precision,

            "Macro_Recall":
                recall,

            "Macro_F1":
                f1,

            "Misclassified":
                len(errors),

            "High_to_Low":
                critical_underprioritization,

            "High_to_Medium":
                high_to_medium,
        }
    )


    trained_models[
        model_name
    ] = pipeline


    error_tables[
        model_name
    ] = errors


# =========================================================
# MODEL COMPARISON
# =========================================================

results_df = pd.DataFrame(
    results
)


# Prefer:
# 1. Higher Macro F1
# 2. Higher Accuracy
# 3. Fewer High -> Low mistakes
# 4. Fewer total errors

results_df = (
    results_df
    .sort_values(
        by=[
            "Macro_F1",
            "Accuracy",
            "High_to_Low",
            "Misclassified",
        ],
        ascending=[
            False,
            False,
            True,
            True,
        ],
    )
    .reset_index(
        drop=True
    )
)


print("\n" + "=" * 75)
print("V3 UNSEEN PRIORITY MODEL COMPARISON")
print("=" * 75)


print(
    "\n"
    + results_df.to_string(
        index=False,

        float_format=lambda x:
            f"{x:.4f}",
    )
)


# =========================================================
# BEST MODEL
# =========================================================

best_model_name = (
    results_df.iloc[0][
        "Model"
    ]
)


best_accuracy = float(
    results_df.iloc[0][
        "Accuracy"
    ]
)


best_macro_f1 = float(
    results_df.iloc[0][
        "Macro_F1"
    ]
)


best_errors = int(
    results_df.iloc[0][
        "Misclassified"
    ]
)


best_high_to_low = int(
    results_df.iloc[0][
        "High_to_Low"
    ]
)


best_high_to_medium = int(
    results_df.iloc[0][
        "High_to_Medium"
    ]
)


print("\n" + "=" * 75)
print("BEST V3 PRIORITY MODEL ON INDEPENDENT UNSEEN DATA")
print("=" * 75)


print(
    f"\nBest Model      : "
    f"{best_model_name}"
)

print(
    f"Accuracy        : "
    f"{best_accuracy:.4f}"
)

print(
    f"Macro F1        : "
    f"{best_macro_f1:.4f}"
)

print(
    f"Errors          : "
    f"{best_errors}"
)

print(
    f"High -> Low     : "
    f"{best_high_to_low}"
)

print(
    f"High -> Medium  : "
    f"{best_high_to_medium}"
)


# =========================================================
# BEST MODEL ERROR BREAKDOWN
# =========================================================

best_errors_df = (
    error_tables[
        best_model_name
    ]
)


print("\n" + "=" * 75)
print("BEST V3 MODEL PRIORITY ERROR BREAKDOWN")
print("=" * 75)


if len(best_errors_df) == 0:

    print(
        "\nNo unseen misclassifications."
    )

else:

    best_error_pairs = (
        best_errors_df
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
            "count",
            ascending=False,
        )
    )


    print(
        "\n"
        + best_error_pairs.to_string(
            index=False
        )
    )


# =========================================================
# V2 BASELINE VS V3
# =========================================================

accuracy_change = (
    best_accuracy
    - V2_BASELINE_ACCURACY
)

macro_f1_change = (
    best_macro_f1
    - V2_BASELINE_MACRO_F1
)

errors_reduced = (
    V2_BASELINE_ERRORS
    - best_errors
)


print("\n" + "=" * 75)
print("V2 BASELINE VS V3")
print("=" * 75)


print(
    "\nV2 Baseline:"
)

print(
    f"Accuracy : "
    f"{V2_BASELINE_ACCURACY:.4f}"
)

print(
    f"Macro F1 : "
    f"{V2_BASELINE_MACRO_F1:.4f}"
)

print(
    f"Errors   : "
    f"{V2_BASELINE_ERRORS}"
)


print(
    "\nV3 Best Result:"
)

print(
    f"Model    : "
    f"{best_model_name}"
)

print(
    f"Accuracy : "
    f"{best_accuracy:.4f}"
)

print(
    f"Macro F1 : "
    f"{best_macro_f1:.4f}"
)

print(
    f"Errors   : "
    f"{best_errors}"
)


print(
    "\nImprovement:"
)

print(
    f"Accuracy Change : "
    f"{accuracy_change:+.4f}"
)

print(
    f"Macro F1 Change : "
    f"{macro_f1_change:+.4f}"
)

print(
    f"Errors Reduced  : "
    f"{errors_reduced:+d}"
)


# =========================================================
# IMPROVEMENT DECISION
# =========================================================

print("\n" + "=" * 75)
print("V3 IMPROVEMENT DECISION")
print("=" * 75)


accuracy_improved = (
    best_accuracy
    > V2_BASELINE_ACCURACY
)

f1_improved = (
    best_macro_f1
    > V2_BASELINE_MACRO_F1
)

errors_improved = (
    best_errors
    < V2_BASELINE_ERRORS
)


if (
    accuracy_improved
    and
    f1_improved
):

    print(
        "\nSUCCESS:"
    )

    print(
        "Priority V3 improved both independent "
        "unseen Accuracy and Macro F1 compared "
        "with the V2 baseline."
    )

elif (
    accuracy_improved
    or
    f1_improved
):

    print(
        "\nPARTIAL IMPROVEMENT:"
    )

    print(
        "Priority V3 improved at least one "
        "primary unseen metric, but not both."
    )

else:

    print(
        "\nNO IMPROVEMENT:"
    )

    print(
        "Priority V3 did not improve the main "
        "independent unseen metrics compared "
        "with V2."
    )


if errors_improved:

    print(
        f"\nTotal unseen errors were reduced by "
        f"{errors_reduced}."
    )


# =========================================================
# SAFETY INTERPRETATION
# =========================================================

print("\n" + "=" * 75)
print("SAFETY-SENSITIVE PRIORITY CHECK")
print("=" * 75)


if best_high_to_low == 0:

    print(
        "\nPASS:"
    )

    print(
        "The selected V3 model made no "
        "High -> Low errors on the independent "
        "unseen dataset."
    )

else:

    print(
        "\nWARNING:"
    )

    print(
        f"The selected V3 model made "
        f"{best_high_to_low} High -> Low "
        f"error(s)."
    )

    print(
        "These errors should be inspected "
        "carefully before production use."
    )


# =========================================================
# FINAL SUMMARY
# =========================================================

print("\n" + "=" * 75)
print("PRIORITY V3 EVALUATION SUMMARY")
print("=" * 75)


print(
    "\nTraining dataset:"
)

print(
    "priority_training_dataset_v3.csv"
)


print(
    "\nIndependent evaluation dataset:"
)

print(
    "manual_unseen_priority_test_dataset.csv"
)


print(
    "\nThe independent unseen priority test "
    "dataset was not used for model training "
    "or V3 augmentation."
)


print(
    "\nBest V3 Model:"
)

print(
    best_model_name
)


print(
    f"\nFinal Unseen Accuracy : "
    f"{best_accuracy:.4f}"
)

print(
    f"Final Unseen Macro F1 : "
    f"{best_macro_f1:.4f}"
)

print(
    f"Final Unseen Errors   : "
    f"{best_errors}"
)


print("\n" + "=" * 75)
print("NEXT STEP")
print("=" * 75)

print(
    "\nDo NOT save/replace the production "
    "priority model yet."
)

print(
    "First review this V3 independent unseen "
    "evaluation result."
)