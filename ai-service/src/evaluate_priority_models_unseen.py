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

TRAIN_PATH = Path(
    "../datasets/priority/priority_training_dataset_v2.csv"
)

UNSEEN_TEST_PATH = Path(
    "../datasets/priority/manual_unseen_priority_test_dataset.csv"
)

RANDOM_STATE = 42

# =========================================================
# LOAD DATASETS
# =========================================================

print("=" * 80)
print("PRIORITY MODELS - INDEPENDENT UNSEEN EVALUATION")
print("=" * 80)

train_df = pd.read_csv(TRAIN_PATH)
test_df = pd.read_csv(UNSEEN_TEST_PATH)

train_df = train_df[
    ["complaint_text", "priority"]
].dropna()

test_df = test_df[
    ["complaint_text", "priority"]
].dropna()

print("\nTraining Dataset:")
print(train_df.shape)

print("\nUnseen Test Dataset:")
print(test_df.shape)

print("\nTraining Distribution:")
print(
    train_df["priority"]
    .value_counts()
    .sort_index()
)

print("\nUnseen Distribution:")
print(
    test_df["priority"]
    .value_counts()
    .sort_index()
)

# =========================================================
# DATA LEAKAGE CHECK
# =========================================================

train_texts = set(
    train_df["complaint_text"]
    .astype(str)
    .str.lower()
    .str.strip()
)

test_texts = set(
    test_df["complaint_text"]
    .astype(str)
    .str.lower()
    .str.strip()
)

overlap = train_texts.intersection(
    test_texts
)

print("\n" + "=" * 80)
print("DATA LEAKAGE CHECK")
print("=" * 80)

print(
    f"\nExact text overlap between "
    f"training and unseen test: {len(overlap)}"
)

if len(overlap) > 0:
    print(
        "\nWARNING: Exact overlapping texts detected!"
    )

    for text in list(overlap)[:10]:
        print("-", text)

else:
    print(
        "PASS: No exact complaint text overlap detected."
    )

# =========================================================
# PREPARE DATA
# =========================================================

X_train = (
    train_df["complaint_text"]
    .astype(str)
)

y_train = (
    train_df["priority"]
    .astype(str)
)

X_test = (
    test_df["complaint_text"]
    .astype(str)
)

y_test = (
    test_df["priority"]
    .astype(str)
)

# =========================================================
# MODELS
# =========================================================

models = {
    "Logistic Regression": LogisticRegression(
        max_iter=2000,
        random_state=RANDOM_STATE,
    ),

    "Linear SVM": LinearSVC(
        random_state=RANDOM_STATE,
    ),

    "Multinomial Naive Bayes": MultinomialNB(),
}

results = []

all_errors = {}

# =========================================================
# TRAIN AND EVALUATE
# =========================================================

for model_name, classifier in models.items():

    print("\n" + "=" * 80)
    print(model_name.upper())
    print("=" * 80)

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

    # Train ONLY using V2 training data
    pipeline.fit(
        X_train,
        y_train
    )

    # Predict completely separate unseen data
    predictions = pipeline.predict(
        X_test
    )

    # =====================================================
    # METRICS
    # =====================================================

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    precision, recall, f1, _ = (
        precision_recall_fscore_support(
            y_test,
            predictions,
            average="macro",
            zero_division=0,
        )
    )

    errors = int(
        (
            predictions != y_test.values
        ).sum()
    )

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
        f"Macro F1-Score  : {f1:.4f}"
    )

    print(
        f"Misclassified   : {errors}"
    )

    # =====================================================
    # CLASSIFICATION REPORT
    # =====================================================

    print("\nClassification Report:")

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

    print(
        "Confusion Matrix "
        "[low, medium, high]:"
    )

    matrix = confusion_matrix(
        y_test,
        predictions,
        labels=[
            "low",
            "medium",
            "high",
        ],
    )

    print(matrix)

    # =====================================================
    # SAVE MISCLASSIFIED RECORDS
    # =====================================================

    error_df = pd.DataFrame(
        {
            "complaint_text": X_test.values,
            "actual": y_test.values,
            "predicted": predictions,
        }
    )

    error_df = error_df[
        error_df["actual"]
        != error_df["predicted"]
    ].copy()

    all_errors[model_name] = error_df

    print("\nMisclassified Complaints:")

    if error_df.empty:

        print(
            "No misclassified complaints."
        )

    else:

        print(
            error_df.to_string(
                index=False
            )
        )

    # =====================================================
    # STORE RESULT
    # =====================================================

    results.append(
        {
            "Model": model_name,
            "Accuracy": accuracy,
            "Macro_Precision": precision,
            "Macro_Recall": recall,
            "Macro_F1": f1,
            "Misclassified": errors,
        }
    )

# =========================================================
# FINAL COMPARISON
# =========================================================

results_df = pd.DataFrame(
    results
)

results_df = results_df.sort_values(
    by=[
        "Macro_F1",
        "Accuracy",
        "Macro_Recall",
    ],
    ascending=False,
).reset_index(drop=True)

print("\n" + "=" * 80)
print("FINAL UNSEEN PRIORITY MODEL COMPARISON")
print("=" * 80)

print(
    results_df.to_string(
        index=False,
        float_format=lambda x: f"{x:.4f}",
    )
)

# =========================================================
# BEST MODEL
# =========================================================

best = results_df.iloc[0]

print("\n" + "=" * 80)
print("BEST PRIORITY MODEL ON UNSEEN DATA")
print("=" * 80)

print(
    f"\nModel           : {best['Model']}"
)

print(
    f"Accuracy        : {best['Accuracy']:.4f}"
)

print(
    f"Macro Precision : "
    f"{best['Macro_Precision']:.4f}"
)

print(
    f"Macro Recall    : "
    f"{best['Macro_Recall']:.4f}"
)

print(
    f"Macro F1        : "
    f"{best['Macro_F1']:.4f}"
)

print(
    f"Misclassified   : "
    f"{int(best['Misclassified'])}"
)

print(
    "\nThis independent unseen evaluation "
    "should be used for final model selection."
)