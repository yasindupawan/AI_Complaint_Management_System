import joblib
import pandas as pd
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

TRAIN_DATASET = Path(
    "../datasets/final_complaint_training_dataset_v3.csv"
)

TEST_DATASET = Path(
    "../datasets/manual_unseen_test_dataset.csv"
)

MODEL_OUTPUT = Path(
    "../models/complaint_classifier.joblib"
)

RANDOM_STATE = 42


# =========================================================
# LOAD DATASETS
# =========================================================

print("=" * 75)
print("FINAL CATEGORY PRODUCTION MODEL - V3")
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

test_df["complaint_text"] = (
    test_df["complaint_text"]
    .astype(str)
    .str.strip()
)

train_df["category"] = (
    train_df["category"]
    .astype(str)
    .str.strip()
)

test_df["category"] = (
    test_df["category"]
    .astype(str)
    .str.strip()
)

print(
    f"\nTraining Dataset Shape : "
    f"{train_df.shape}"
)

print(
    f"Unseen Test Shape      : "
    f"{test_df.shape}"
)


# =========================================================
# CATEGORY DISTRIBUTION
# =========================================================

print("\nTraining Distribution:")

print(
    train_df["category"]
    .value_counts()
    .sort_index()
)


# =========================================================
# TRAIN / TEST LEAKAGE CHECK
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
        "\nWARNING: Training and test "
        "datasets contain overlapping texts."
    )


# =========================================================
# PREPARE DATA
# =========================================================

X_train = train_df[
    "complaint_text"
].astype(str)

y_train = train_df[
    "category"
].astype(str)

X_test = test_df[
    "complaint_text"
].astype(str)

y_test = test_df[
    "category"
].astype(str)


# =========================================================
# FINAL MODEL
# =========================================================
#
# Why calibrated Linear SVM?
#
# 1. Linear SVM produced the strongest independent
#    unseen performance during V3 model comparison.
#
# 2. LinearSVC itself does not provide predict_proba().
#
# 3. CalibratedClassifierCV adds probability estimates,
#    allowing the FastAPI service to return category
#    confidence values.
#
# =========================================================

print("\n" + "=" * 75)
print("MODEL CONFIGURATION")
print("=" * 75)

print(
    "\nVectorizer : TF-IDF"
)

print(
    "Classifier : Calibrated Linear SVM"
)

print(
    "Base Model : LinearSVC"
)

print(
    "SVM C      : 1.0"
)

print(
    "Calibration: 5-fold"
)


# =========================================================
# CREATE BASE SVM
# =========================================================

base_svm = LinearSVC(
    C=1.0,
    random_state=RANDOM_STATE,
)


# =========================================================
# CALIBRATED CLASSIFIER
# =========================================================

calibrated_svm = CalibratedClassifierCV(
    estimator=base_svm,
    method="sigmoid",
    cv=5,
)


# =========================================================
# COMPLETE PIPELINE
# =========================================================

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
            calibrated_svm,
        ),
    ]
)


# =========================================================
# TRAIN MODEL
# =========================================================

print("\n" + "=" * 75)
print("TRAINING PRODUCTION MODEL")
print("=" * 75)

print(
    "\nTraining model..."
)

model.fit(
    X_train,
    y_train,
)

print(
    "Training completed successfully."
)


# =========================================================
# INDEPENDENT UNSEEN EVALUATION
# =========================================================

print("\n" + "=" * 75)
print("INDEPENDENT UNSEEN EVALUATION")
print("=" * 75)

predictions = model.predict(
    X_test
)

probabilities = model.predict_proba(
    X_test
)

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
    f"Macro F1        : "
    f"{f1:.4f}"
)


# =========================================================
# CLASSIFICATION REPORT
# =========================================================

print("\nClassification Report:")

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
    "Confusion Matrix:"
)

print(
    matrix_df.to_string()
)


# =========================================================
# MISCLASSIFIED COMPLAINTS
# =========================================================

error_df = pd.DataFrame(
    {
        "complaint_text":
            X_test.values,

        "actual":
            y_test.values,

        "predicted":
            predictions,

        "confidence":
            probabilities.max(
                axis=1
            ),
    }
)

errors = error_df[
    error_df["actual"]
    != error_df["predicted"]
].copy()

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
# CONFIDENCE SUMMARY
# =========================================================

print("\n" + "=" * 75)
print("CONFIDENCE SUMMARY")
print("=" * 75)

max_confidences = (
    probabilities.max(
        axis=1
    )
)

print(
    f"\nAverage Confidence : "
    f"{max_confidences.mean():.4f}"
)

print(
    f"Minimum Confidence : "
    f"{max_confidences.min():.4f}"
)

print(
    f"Maximum Confidence : "
    f"{max_confidences.max():.4f}"
)


# =========================================================
# CRITICAL REAL-WORLD TEST
# =========================================================

print("\n" + "=" * 75)
print("CRITICAL REAL-WORLD CATEGORY TEST")
print("=" * 75)

critical_tests = [
    (
        "Garbage has piled up near the school "
        "in our village, take immediate action."
    ),

    (
        "A large pile of garbage has accumulated "
        "outside the school."
    ),

    (
        "There is a large pothole near the school."
    ),

    (
        "The taps in our neighbourhood have been "
        "dry for two days."
    ),

    (
        "A live electrical wire is hanging "
        "beside the school entrance."
    ),

    (
        "The roadside drain is blocked and "
        "rainwater is flooding the street."
    ),

    (
        "A strong chemical smell is spreading "
        "through the neighbourhood."
    ),
]

critical_predictions = model.predict(
    critical_tests
)

critical_probabilities = (
    model.predict_proba(
        critical_tests
    )
)

for index, complaint in enumerate(
    critical_tests
):

    confidence = float(
        critical_probabilities[
            index
        ].max()
    )

    print(
        "\n" + "-" * 75
    )

    print(
        f"Complaint : {complaint}"
    )

    print(
        f"Category  : "
        f"{critical_predictions[index]}"
    )

    print(
        f"Confidence: "
        f"{confidence:.4f}"
    )


# =========================================================
# SAVE PRODUCTION MODEL
# =========================================================

print("\n" + "=" * 75)
print("SAVE PRODUCTION MODEL")
print("=" * 75)

MODEL_OUTPUT.parent.mkdir(
    parents=True,
    exist_ok=True,
)

joblib.dump(
    model,
    MODEL_OUTPUT,
)

print(
    "\nModel saved successfully:"
)

print(
    MODEL_OUTPUT.resolve()
)


# =========================================================
# VERIFY SAVED MODEL
# =========================================================

print("\n" + "=" * 75)
print("VERIFY SAVED MODEL")
print("=" * 75)

loaded_model = joblib.load(
    MODEL_OUTPUT
)

verification_text = (
    "Garbage has piled up near the school "
    "and needs to be removed immediately."
)

verification_prediction = (
    loaded_model.predict(
        [verification_text]
    )[0]
)

verification_probabilities = (
    loaded_model.predict_proba(
        [verification_text]
    )[0]
)

verification_confidence = float(
    verification_probabilities.max()
)

print(
    f"\nTest Complaint:"
)

print(
    verification_text
)

print(
    "\nPredicted Category:"
)

print(
    verification_prediction
)

print(
    "\nConfidence:"
)

print(
    round(
        verification_confidence,
        4
    )
)


# =========================================================
# COMPLETE
# =========================================================

print("\n" + "=" * 75)
print("FINAL CATEGORY MODEL READY")
print("=" * 75)

print(
    "\nProduction category classifier "
    "has been trained, evaluated, saved "
    "and successfully reloaded."
)

print(
    "\nFastAPI compatibility:"
)

print(
    "predict()       : YES"
)

print(
    "predict_proba() : YES"
)