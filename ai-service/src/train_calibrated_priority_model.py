import pandas as pd
import joblib
from pathlib import Path

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV

from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    classification_report,
    confusion_matrix,
)

# =========================================================
# PATHS
# =========================================================

TRAIN_PATH = Path(
    "../datasets/priority/priority_training_dataset_v2.csv"
)

TEST_PATH = Path(
    "../datasets/priority/manual_unseen_priority_test_dataset.csv"
)

MODEL_PATH = Path(
    "../models/priority_classifier_calibrated.joblib"
)

# =========================================================
# LOAD DATA
# =========================================================

print("=" * 80)
print("TRAINING CALIBRATED PRIORITY MODEL")
print("=" * 80)

train_df = pd.read_csv(TRAIN_PATH)
test_df = pd.read_csv(TEST_PATH)

train_df = train_df[
    ["complaint_text", "priority"]
].dropna()

test_df = test_df[
    ["complaint_text", "priority"]
].dropna()

X_train = train_df["complaint_text"].astype(str)
y_train = train_df["priority"].astype(str)

X_test = test_df["complaint_text"].astype(str)
y_test = test_df["priority"].astype(str)

print(f"\nTraining Records : {len(train_df)}")
print(f"Unseen Records   : {len(test_df)}")

# =========================================================
# MODEL
# =========================================================

base_svm = LinearSVC(
    random_state=42
)

calibrated_svm = CalibratedClassifierCV(
    estimator=base_svm,
    method="sigmoid",
    cv=5,
)

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
            calibrated_svm,
        ),
    ]
)

# =========================================================
# TRAIN
# =========================================================

print("\nTraining calibrated Linear SVM...")

pipeline.fit(
    X_train,
    y_train
)

print("Training completed successfully.")

# =========================================================
# UNSEEN EVALUATION
# =========================================================

predictions = pipeline.predict(
    X_test
)

probabilities = pipeline.predict_proba(
    X_test
)

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

print("\n" + "=" * 80)
print("CALIBRATED MODEL - UNSEEN EVALUATION")
print("=" * 80)

print(f"\nAccuracy        : {accuracy:.4f}")
print(f"Macro Precision : {precision:.4f}")
print(f"Macro Recall    : {recall:.4f}")
print(f"Macro F1        : {f1:.4f}")
print(f"Misclassified   : {errors}")

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

print(
    "Confusion Matrix [low, medium, high]:"
)

print(
    confusion_matrix(
        y_test,
        predictions,
        labels=[
            "low",
            "medium",
            "high",
        ],
    )
)

# =========================================================
# CONFIDENCE ANALYSIS
# =========================================================

confidence_values = (
    probabilities.max(axis=1)
)

print("\nConfidence Statistics:")

print(
    pd.Series(
        confidence_values
    ).describe()
)

# =========================================================
# QUICK TEST
# =========================================================

quick_tests = [
    "One street lamp near our house is dim but still working.",

    "Several potholes on the main road are making vehicles slow down.",

    "An exposed electrical wire is hanging beside the school entrance.",

    "Garbage has not been collected from our street for a week.",

    "A major water pipe has burst and water is entering nearby houses.",

    "A small amount of litter is scattered near the bus stop.",
]

quick_predictions = pipeline.predict(
    quick_tests
)

quick_probabilities = pipeline.predict_proba(
    quick_tests
)

print("\n" + "=" * 80)
print("QUICK CALIBRATED PRIORITY TEST")
print("=" * 80)

for text, prediction, probs in zip(
    quick_tests,
    quick_predictions,
    quick_probabilities,
):
    confidence = float(
        probs.max()
    )

    print("\nComplaint:")
    print(text)

    print("Priority:")
    print(prediction)

    print("Priority Confidence:")
    print(
        round(
            confidence,
            4
        )
    )

# =========================================================
# SAVE FINAL MODEL
# =========================================================

MODEL_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)

joblib.dump(
    pipeline,
    MODEL_PATH
)

print("\n" + "=" * 80)
print("CALIBRATED PRIORITY MODEL SAVED")
print("=" * 80)

print(
    f"\nModel Path:\n{MODEL_PATH}"
)

print(
    "\nUse this model only if its unseen performance "
    "remains acceptable compared with the original Linear SVM."
)