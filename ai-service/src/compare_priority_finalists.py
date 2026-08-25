from pathlib import Path

import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC
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

RANDOM_STATE = 42

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

TEST_DATASET = (
    PRIORITY_DATA_DIR
    / "manual_unseen_priority_test_dataset.csv"
)


# =========================================================
# LOAD DATA
# =========================================================

print("=" * 75)
print("FINAL PRIORITY MODEL COMPARISON")
print("=" * 75)

if not TRAIN_DATASET.exists():
    raise FileNotFoundError(
        f"Training dataset not found:\n{TRAIN_DATASET}"
    )

if not TEST_DATASET.exists():
    raise FileNotFoundError(
        f"Test dataset not found:\n{TEST_DATASET}"
    )

train_df = pd.read_csv(TRAIN_DATASET)
test_df = pd.read_csv(TEST_DATASET)


# =========================================================
# VALIDATE + CLEAN
# =========================================================

required_columns = {
    "complaint_text",
    "priority",
}

if not required_columns.issubset(
    train_df.columns
):
    raise ValueError(
        "Training dataset is missing required columns."
    )

if not required_columns.issubset(
    test_df.columns
):
    raise ValueError(
        "Test dataset is missing required columns."
    )

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

for dataframe in [
    train_df,
    test_df,
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
# DATASET INFO
# =========================================================

print(
    f"\nTraining Dataset Shape : "
    f"{train_df.shape}"
)

print(
    f"Test Dataset Shape     : "
    f"{test_df.shape}"
)

print(
    "\nTraining Distribution:"
)

print(
    train_df[
        "priority"
    ]
    .value_counts()
    .sort_index()
)

print(
    "\nTest Distribution:"
)

print(
    test_df[
        "priority"
    ]
    .value_counts()
    .sort_index()
)


# =========================================================
# LEAKAGE CHECK
# =========================================================

print("\n" + "=" * 75)
print("LEAKAGE CHECK")
print("=" * 75)

train_texts = set(
    train_df[
        "complaint_text"
    ]
    .str.lower()
    .str.strip()
)

test_texts = set(
    test_df[
        "complaint_text"
    ]
    .str.lower()
    .str.strip()
)

overlap = (
    train_texts
    & test_texts
)

print(
    f"\nExact Text Overlap: "
    f"{len(overlap)}"
)

if overlap:
    raise ValueError(
        "Evaluation stopped because "
        "train/test overlap was found."
    )

print(
    "\nPASS: No exact train/test overlap."
)


# =========================================================
# INPUT / TARGET
# =========================================================

X_train = train_df[
    "complaint_text"
]

y_train = train_df[
    "priority"
]

X_test = test_df[
    "complaint_text"
]

y_test = test_df[
    "priority"
]


# =========================================================
# FINALISTS
# =========================================================

finalists = {
    "Linear SVM":
        LinearSVC(
            random_state=RANDOM_STATE,
        ),

    "Multinomial Naive Bayes":
        MultinomialNB(),
}


# =========================================================
# SHARED PIPELINE CONFIGURATION
# =========================================================

def build_pipeline(
    classifier,
):
    return Pipeline(
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


# =========================================================
# STORAGE
# =========================================================

results = []

error_tables = {}

trained_models = {}


# =========================================================
# EVALUATE FINALISTS
# =========================================================

for (
    model_name,
    classifier,
) in finalists.items():

    print(
        "\n" + "=" * 75
    )

    print(
        model_name.upper()
    )

    print(
        "=" * 75
    )

    model = build_pipeline(
        classifier
    )

    model.fit(
        X_train,
        y_train,
    )

    predictions = model.predict(
        X_test
    )

    accuracy = accuracy_score(
        y_test,
        predictions,
    )

    (
        macro_precision,
        macro_recall,
        macro_f1,
        _,
    ) = precision_recall_fscore_support(
        y_test,
        predictions,
        average="macro",
        zero_division=0,
    )

    high_recall = recall_score(
        y_test,
        predictions,
        labels=["high"],
        average="macro",
        zero_division=0,
    )

    medium_recall = recall_score(
        y_test,
        predictions,
        labels=["medium"],
        average="macro",
        zero_division=0,
    )

    low_recall = recall_score(
        y_test,
        predictions,
        labels=["low"],
        average="macro",
        zero_division=0,
    )

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
        f"\nHigh Recall     : "
        f"{high_recall:.4f}"
    )

    print(
        f"Medium Recall   : "
        f"{medium_recall:.4f}"
    )

    print(
        f"Low Recall      : "
        f"{low_recall:.4f}"
    )


    # =====================================================
    # REPORT
    # =====================================================

    print(
        "\nClassification Report:"
    )

    print(
        classification_report(
            y_test,
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


    # =====================================================
    # CONFUSION MATRIX
    # =====================================================

    labels = [
        "low",
        "medium",
        "high",
    ]

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
        "Confusion Matrix:"
    )

    print(
        matrix_df.to_string()
    )


    # =====================================================
    # ERROR TABLE
    # =====================================================

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
            error_df[
                "actual"
            ]
            != error_df[
                "predicted"
            ]
        ]
        .copy()
    )


    # =====================================================
    # SEVERITY ERRORS
    # =====================================================

    def count_pair(
        actual_label,
        predicted_label,
    ):
        return len(
            errors[
                (
                    errors[
                        "actual"
                    ]
                    == actual_label
                )
                &
                (
                    errors[
                        "predicted"
                    ]
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
        f"\nMisclassified Records: "
        f"{len(errors)}"
    )

    print(
        "\nSeverity Errors:"
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


    # =====================================================
    # HIGH PRIORITY ERRORS
    # =====================================================

    high_errors = errors[
        errors[
            "actual"
        ]
        == "high"
    ]

    print(
        "\nHigh-Priority Misclassifications:"
    )

    if len(
        high_errors
    ) == 0:

        print(
            "None"
        )

    else:

        print(
            high_errors.to_string(
                index=False
            )
        )


    # =====================================================
    # ALL ERRORS
    # =====================================================

    print(
        "\nAll Misclassified Examples:"
    )

    if len(errors) == 0:

        print(
            "None"
        )

    else:

        print(
            errors.to_string(
                index=False
            )
        )


    # =====================================================
    # SAFETY PENALTY
    # =====================================================
    #
    # Weighted penalty:
    #
    # High -> Low    = most serious
    # High -> Medium = serious under-prioritization
    # Medium -> Low  = moderate under-prioritization
    # Low -> High    = over-prioritization
    #
    # =====================================================

    safety_penalty = (
        high_to_low * 5
        +
        high_to_medium * 3
        +
        medium_to_low * 2
        +
        low_to_high * 1
    )


    # =====================================================
    # COMPOSITE SAFETY SCORE
    # =====================================================
    #
    # Higher = better.
    #
    # Main quality:
    #   Macro F1
    #
    # Strong weight:
    #   High recall
    #
    # Small penalty:
    #   severity errors
    #
    # =====================================================

    safety_score = (
        macro_f1 * 0.60
        +
        high_recall * 0.40
        -
        safety_penalty * 0.002
    )


    print(
        f"\nSafety Penalty : "
        f"{safety_penalty}"
    )

    print(
        f"Safety Score   : "
        f"{safety_score:.4f}"
    )


    # =====================================================
    # SAVE RESULT
    # =====================================================

    results.append(
        {
            "Model":
                model_name,

            "Accuracy":
                accuracy,

            "Macro_F1":
                macro_f1,

            "High_Recall":
                high_recall,

            "Medium_Recall":
                medium_recall,

            "Low_Recall":
                low_recall,

            "Errors":
                len(errors),

            "High_to_Low":
                high_to_low,

            "High_to_Medium":
                high_to_medium,

            "Medium_to_Low":
                medium_to_low,

            "Medium_to_High":
                medium_to_high,

            "Low_to_Medium":
                low_to_medium,

            "Low_to_High":
                low_to_high,

            "Safety_Penalty":
                safety_penalty,

            "Safety_Score":
                safety_score,
        }
    )

    error_tables[
        model_name
    ] = errors

    trained_models[
        model_name
    ] = model


# =========================================================
# COMPARISON
# =========================================================

results_df = pd.DataFrame(
    results
)

results_df = (
    results_df
    .sort_values(
        by=[
            "Safety_Score",
            "High_to_Low",
            "High_Recall",
            "Macro_F1",
        ],
        ascending=[
            False,
            True,
            False,
            False,
        ],
    )
    .reset_index(
        drop=True
    )
)


print(
    "\n" + "=" * 75
)

print(
    "FINALIST COMPARISON"
)

print(
    "=" * 75
)

print(
    "\n"
    + results_df.to_string(
        index=False,
        float_format=lambda value:
            f"{value:.4f}",
    )
)


# =========================================================
# SELECT FINAL MODEL
# =========================================================

selected_model_name = (
    results_df.iloc[0][
        "Model"
    ]
)

selected_accuracy = float(
    results_df.iloc[0][
        "Accuracy"
    ]
)

selected_macro_f1 = float(
    results_df.iloc[0][
        "Macro_F1"
    ]
)

selected_high_recall = float(
    results_df.iloc[0][
        "High_Recall"
    ]
)

selected_high_to_low = int(
    results_df.iloc[0][
        "High_to_Low"
    ]
)

selected_high_to_medium = int(
    results_df.iloc[0][
        "High_to_Medium"
    ]
)

selected_errors = int(
    results_df.iloc[0][
        "Errors"
    ]
)

selected_safety_score = float(
    results_df.iloc[0][
        "Safety_Score"
    ]
)


print(
    "\n" + "=" * 75
)

print(
    "FINAL PRIORITY MODEL SELECTION"
)

print(
    "=" * 75
)

print(
    f"\nSelected Model  : "
    f"{selected_model_name}"
)

print(
    f"Accuracy        : "
    f"{selected_accuracy:.4f}"
)

print(
    f"Macro F1        : "
    f"{selected_macro_f1:.4f}"
)

print(
    f"High Recall     : "
    f"{selected_high_recall:.4f}"
)

print(
    f"Errors          : "
    f"{selected_errors}"
)

print(
    f"High -> Low     : "
    f"{selected_high_to_low}"
)

print(
    f"High -> Medium  : "
    f"{selected_high_to_medium}"
)

print(
    f"Safety Score    : "
    f"{selected_safety_score:.4f}"
)


# =========================================================
# FINAL SAFETY CHECK
# =========================================================

print(
    "\n" + "=" * 75
)

print(
    "FINAL SAFETY CHECK"
)

print(
    "=" * 75
)

if (
    selected_high_to_low
    == 0
):

    print(
        "\nPASS:"
    )

    print(
        "Selected model produced no "
        "High -> Low errors."
    )

else:

    print(
        "\nWARNING:"
    )

    print(
        "Selected model produced "
        "High -> Low errors."
    )


# =========================================================
# INTERPRETATION
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

print(
    "\nSelection is based on both general "
    "classification performance and "
    "safety-sensitive severity errors."
)

print(
    "\nThe independent unseen test dataset "
    "was not used for model training "
    "or V3 augmentation."
)

print(
    "\nDo NOT save the production model yet."
)

print(
    "Review this comparison before "
    "training the final calibrated "
    "production priority classifier."
)