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
print("INDEPENDENT UNSEEN MODEL EVALUATION - CATEGORY V3")
print("=" * 75)

if not TRAIN_DATASET.exists():
    raise FileNotFoundError(
        f"Training dataset not found:\n"
        f"{TRAIN_DATASET.resolve()}"
    )

if not TEST_DATASET.exists():
    raise FileNotFoundError(
        f"Unseen test dataset not found:\n"
        f"{TEST_DATASET.resolve()}"
    )

train_df = pd.read_csv(
    TRAIN_DATASET
)

test_df = pd.read_csv(
    TEST_DATASET
)


# =========================================================
# VALIDATE REQUIRED COLUMNS
# =========================================================

required_columns = {
    "complaint_text",
    "category",
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
        "Training dataset is missing columns: "
        f"{sorted(missing_train_columns)}"
    )

if missing_test_columns:
    raise ValueError(
        "Test dataset is missing columns: "
        f"{sorted(missing_test_columns)}"
    )


# =========================================================
# PREPARE DATA
# =========================================================

train_df = (
    train_df[
        [
            "complaint_text",
            "category",
        ]
    ]
    .dropna()
    .copy()
)

test_df = (
    test_df[
        [
            "complaint_text",
            "category",
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


# =========================================================
# DATASET INFORMATION
# =========================================================

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
    train_df["category"]
    .value_counts()
    .sort_index()
)

print("\nUnseen Test Distribution:")

print(
    test_df["category"]
    .value_counts()
    .sort_index()
)


# =========================================================
# CHECK TRAIN / TEST TEXT OVERLAP
# =========================================================

train_text_set = set(
    train_df["complaint_text"]
    .str.lower()
    .str.strip()
)

test_text_set = set(
    test_df["complaint_text"]
    .str.lower()
    .str.strip()
)

overlap = (
    train_text_set
    & test_text_set
)

print("\n" + "=" * 75)
print("TRAIN / TEST LEAKAGE CHECK")
print("=" * 75)

print(
    f"\nExact text overlap: "
    f"{len(overlap)}"
)

if len(overlap) > 0:
    print(
        "\nWARNING: Exact complaint texts appear "
        "in both training and unseen test data."
    )

    for text in list(overlap)[:10]:
        print(
            f"- {text}"
        )

else:
    print(
        "\nPASS: No exact complaint text overlap detected."
    )


# =========================================================
# FEATURES / LABELS
# =========================================================

X_train = (
    train_df["complaint_text"]
    .astype(str)
)

y_train = (
    train_df["category"]
    .astype(str)
)

X_test = (
    test_df["complaint_text"]
    .astype(str)
)

y_test = (
    test_df["category"]
    .astype(str)
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
# RESULTS STORAGE
# =========================================================

results = []

trained_models = {}

error_tables = {}


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

    # -----------------------------------------------------
    # PRINT MAIN METRICS
    # -----------------------------------------------------

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
            digits=4,
            zero_division=0,
        )
    )

    # -----------------------------------------------------
    # CONFUSION MATRIX
    # -----------------------------------------------------

    labels = sorted(
        y_test.unique()
    )

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
    # MISCLASSIFIED RECORDS
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
            "\nFirst 30 Misclassified Examples:"
        )

        print(
            errors
            .head(30)
            .to_string(
                index=False
            )
        )

    # -----------------------------------------------------
    # MOST COMMON CONFUSION PAIRS
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
            "\nMost Common Misclassification Pairs:"
        )

        print(
            confusion_pairs
            .head(15)
            .to_string(
                index=False
            )
        )

    # -----------------------------------------------------
    # SAVE RESULTS IN MEMORY
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

results_df = (
    results_df
    .sort_values(
        by=[
            "Macro_F1",
            "Accuracy",
        ],
        ascending=False,
    )
    .reset_index(
        drop=True
    )
)

print(
    "\n" + "=" * 75
)

print(
    "V3 UNSEEN MODEL COMPARISON"
)

print(
    "=" * 75
)

print(
    "\n"
    + results_df.to_string(
        index=False,

        float_format=lambda x:
            f"{x:.4f}",
    )
)


# =========================================================
# V2 BASELINE COMPARISON
# =========================================================

V2_BASELINE_ACCURACY = 0.8500
V2_BASELINE_MACRO_F1 = 0.8517
V2_BASELINE_ERRORS = 45

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

accuracy_change = (
    best_accuracy
    - V2_BASELINE_ACCURACY
)

f1_change = (
    best_macro_f1
    - V2_BASELINE_MACRO_F1
)

error_change = (
    V2_BASELINE_ERRORS
    - best_errors
)


# =========================================================
# BEST MODEL
# =========================================================

best_model_name = (
    results_df.iloc[0][
        "Model"
    ]
)

print(
    "\n" + "=" * 75
)

print(
    "BEST MODEL ON INDEPENDENT UNSEEN DATA"
)

print(
    "=" * 75
)

print(
    f"\nBest Model : "
    f"{best_model_name}"
)

print(
    f"Accuracy   : "
    f"{best_accuracy:.4f}"
)

print(
    f"Macro F1   : "
    f"{best_macro_f1:.4f}"
)

print(
    f"Errors     : "
    f"{best_errors}"
)


# =========================================================
# V2 VS V3
# =========================================================

print(
    "\n" + "=" * 75
)

print(
    "V2 BASELINE VS V3"
)

print(
    "=" * 75
)

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
    f"{f1_change:+.4f}"
)

print(
    f"Errors Reduced  : "
    f"{error_change:+d}"
)


# =========================================================
# FINAL INTERPRETATION
# =========================================================

print(
    "\n" + "=" * 75
)

print(
    "FINAL INTERPRETATION"
)

print(
    "=" * 75
)

if (
    best_accuracy > V2_BASELINE_ACCURACY
    and
    best_macro_f1 > V2_BASELINE_MACRO_F1
):

    print(
        "\nSUCCESS:"
    )

    print(
        "V3 improved both independent unseen "
        "accuracy and Macro F1 compared with V2."
    )

elif (
    best_accuracy > V2_BASELINE_ACCURACY
    or
    best_macro_f1 > V2_BASELINE_MACRO_F1
):

    print(
        "\nPARTIAL IMPROVEMENT:"
    )

    print(
        "V3 improved at least one major metric, "
        "but further tuning is recommended."
    )

else:

    print(
        "\nNO IMPROVEMENT:"
    )

    print(
        "V3 did not outperform the V2 baseline "
        "on the independent unseen test set."
    )

print(
    "\nThe same separately authored "
    "300-record unseen test dataset was used "
    "for evaluation."
)

print(
    "The unseen test dataset was not used "
    "to train the V3 model."
)