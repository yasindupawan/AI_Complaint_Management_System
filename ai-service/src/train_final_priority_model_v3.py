import re
from pathlib import Path

import joblib
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.naive_bayes import MultinomialNB


# =========================================================
# CONFIGURATION
# =========================================================

RANDOM_STATE = 42

EXPECTED_PRIORITIES = {
    "low",
    "medium",
    "high",
}

EXPECTED_RECORDS = 4500


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

MODELS_DIR = (
    AI_SERVICE_DIR
    / "models"
)

TRAIN_DATASET = (
    PRIORITY_DATA_DIR
    / "priority_training_dataset_v3.csv"
)

OUTPUT_MODEL = (
    MODELS_DIR
    / "priority_classifier_v3.joblib"
)


# =========================================================
# TEXT CLEANING
# =========================================================

def clean_text(text):
    """
    Basic whitespace cleaning.

    Important:
    The TF-IDF vectorizer performs lowercase conversion
    internally, so aggressive preprocessing is avoided.
    """

    text = str(text)

    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text.strip()


# =========================================================
# NORMALIZATION FOR QUALITY CHECKS ONLY
# =========================================================

def normalize_text(text):
    """
    Normalize complaint text only for duplicate checking.

    This normalized text is NOT used for model training.
    """

    text = clean_text(text).lower()

    text = re.sub(
        r"[^a-z0-9\s]",
        "",
        text,
    )

    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text.strip()


# =========================================================
# HEADER
# =========================================================

print("=" * 75)
print("FINAL PRIORITY PRODUCTION MODEL - V3")
print("=" * 75)

print(
    f"\nTraining Dataset:\n"
    f"{TRAIN_DATASET}"
)

print(
    f"\nOutput Model:\n"
    f"{OUTPUT_MODEL}"
)


# =========================================================
# VERIFY TRAINING DATASET EXISTS
# =========================================================

if not TRAIN_DATASET.exists():

    raise FileNotFoundError(
        f"Priority V3 training dataset "
        f"not found:\n{TRAIN_DATASET}"
    )


# =========================================================
# LOAD TRAINING DATA
# =========================================================

train_df = pd.read_csv(
    TRAIN_DATASET
)


print("\n" + "=" * 75)
print("TRAINING DATASET INFORMATION")
print("=" * 75)

print(
    f"\nOriginal Dataset Shape : "
    f"{train_df.shape}"
)

print(
    "\nDataset Columns:"
)

print(
    train_df.columns.tolist()
)


# =========================================================
# VALIDATE REQUIRED COLUMNS
# =========================================================

required_columns = {
    "complaint_text",
    "priority",
}

missing_columns = (
    required_columns
    - set(train_df.columns)
)

if missing_columns:

    raise ValueError(
        "Training dataset is missing "
        "required columns: "
        f"{sorted(missing_columns)}"
    )


# =========================================================
# KEEP MODEL COLUMNS
# =========================================================

train_df = (
    train_df[
        [
            "complaint_text",
            "priority",
        ]
    ]
    .copy()
)


# =========================================================
# MISSING VALUE CHECK
# =========================================================

print("\n" + "=" * 75)
print("MISSING VALUE CHECK")
print("=" * 75)

print(
    "\n"
    + train_df.isna().sum().to_string()
)


missing_total = int(
    train_df.isna().sum().sum()
)

if missing_total > 0:

    raise ValueError(
        f"Training dataset contains "
        f"{missing_total} missing values."
    )

else:

    print(
        "\nPASS: No missing values detected."
    )


# =========================================================
# CLEAN TRAINING DATA
# =========================================================

train_df["complaint_text"] = (
    train_df["complaint_text"]
    .astype(str)
    .map(clean_text)
)

train_df["priority"] = (
    train_df["priority"]
    .astype(str)
    .str.strip()
    .str.lower()
)


# =========================================================
# EMPTY VALUE CHECK
# =========================================================

empty_text_count = int(
    (
        train_df["complaint_text"]
        .str.len()
        == 0
    ).sum()
)

empty_priority_count = int(
    (
        train_df["priority"]
        .str.len()
        == 0
    ).sum()
)


print("\n" + "=" * 75)
print("EMPTY VALUE CHECK")
print("=" * 75)

print(
    f"\nEmpty Complaint Texts : "
    f"{empty_text_count}"
)

print(
    f"Empty Priority Labels : "
    f"{empty_priority_count}"
)


if empty_text_count > 0:

    raise ValueError(
        "Empty complaint texts detected."
    )


if empty_priority_count > 0:

    raise ValueError(
        "Empty priority labels detected."
    )


print(
    "\nPASS: No empty training values detected."
)


# =========================================================
# LABEL VALIDATION
# =========================================================

print("\n" + "=" * 75)
print("PRIORITY LABEL VALIDATION")
print("=" * 75)


actual_priorities = set(
    train_df[
        "priority"
    ].unique()
)


print(
    "\nPriority Labels:"
)

print(
    sorted(actual_priorities)
)


if actual_priorities != EXPECTED_PRIORITIES:

    raise ValueError(
        "Unexpected priority labels detected. "
        f"Expected: "
        f"{sorted(EXPECTED_PRIORITIES)} | "
        f"Found: "
        f"{sorted(actual_priorities)}"
    )


print(
    "\nPASS: Priority labels are valid."
)


# =========================================================
# CLASS DISTRIBUTION
# =========================================================

print("\n" + "=" * 75)
print("PRIORITY DISTRIBUTION")
print("=" * 75)


priority_distribution = (
    train_df[
        "priority"
    ]
    .value_counts()
    .sort_index()
)


print(
    "\n"
    + priority_distribution.to_string()
)


minimum_class_size = int(
    priority_distribution.min()
)

maximum_class_size = int(
    priority_distribution.max()
)


if (
    minimum_class_size
    != maximum_class_size
):

    raise ValueError(
        "Priority V3 training dataset "
        "is not perfectly balanced."
    )


print(
    "\nPASS: Priority classes are "
    "perfectly balanced."
)


# =========================================================
# EXPECTED RECORD COUNT CHECK
# =========================================================

print("\n" + "=" * 75)
print("TRAINING RECORD VALIDATION")
print("=" * 75)


actual_record_count = len(
    train_df
)


print(
    f"\nExpected Records : "
    f"{EXPECTED_RECORDS}"
)

print(
    f"Actual Records   : "
    f"{actual_record_count}"
)


if (
    actual_record_count
    != EXPECTED_RECORDS
):

    raise ValueError(
        "Unexpected Priority V3 "
        "training record count."
    )


print(
    "\nPASS: Training record count "
    "is correct."
)


# =========================================================
# EXACT DUPLICATE CHECK
# =========================================================

print("\n" + "=" * 75)
print("DUPLICATE CHECK")
print("=" * 75)


exact_duplicates = int(
    train_df[
        "complaint_text"
    ].duplicated().sum()
)


normalized_texts = (
    train_df[
        "complaint_text"
    ]
    .map(normalize_text)
)


normalized_duplicates = int(
    normalized_texts
    .duplicated()
    .sum()
)


print(
    f"\nExact Duplicate Texts      : "
    f"{exact_duplicates}"
)

print(
    f"Normalized Duplicate Texts : "
    f"{normalized_duplicates}"
)


if exact_duplicates > 0:

    raise ValueError(
        "Exact duplicate complaint "
        "texts detected."
    )


if normalized_duplicates > 0:

    raise ValueError(
        "Normalized duplicate complaint "
        "texts detected."
    )


print(
    "\nPASS: No duplicate complaint "
    "texts detected."
)


# =========================================================
# CONFLICTING LABEL CHECK
# =========================================================

print("\n" + "=" * 75)
print("CONFLICTING LABEL CHECK")
print("=" * 75)


quality_df = train_df.copy()

quality_df[
    "normalized_text"
] = normalized_texts


label_counts = (
    quality_df
    .groupby(
        "normalized_text"
    )[
        "priority"
    ]
    .nunique()
)


conflicting_count = int(
    (
        label_counts > 1
    ).sum()
)


print(
    f"\nTexts With Multiple "
    f"Priority Labels : "
    f"{conflicting_count}"
)


if conflicting_count > 0:

    raise ValueError(
        "Conflicting priority labels "
        "detected."
    )


print(
    "\nPASS: No conflicting "
    "priority labels detected."
)


# =========================================================
# MODEL INPUT
# =========================================================

X_train = (
    train_df[
        "complaint_text"
    ]
)

y_train = (
    train_df[
        "priority"
    ]
)


# =========================================================
# FINAL MODEL CONFIGURATION
# =========================================================

print("\n" + "=" * 75)
print("FINAL MODEL CONFIGURATION")
print("=" * 75)


print(
    "\nVectorizer : TF-IDF"
)

print(
    "Classifier : Multinomial Naive Bayes"
)

print(
    "N-Grams    : (1, 2)"
)

print(
    "Min DF     : 2"
)

print(
    "Max DF     : 0.95"
)

print(
    "Sublinear TF : True"
)

print(
    "Stop Words : English"
)

print(
    "\nModel selection was completed "
    "before this production training step."
)

print(
    "The final blind dataset is NOT "
    "used during production training."
)


# =========================================================
# CREATE FINAL PIPELINE
# =========================================================

priority_model = Pipeline(
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
# TRAIN FINAL PRODUCTION MODEL
# =========================================================

print("\n" + "=" * 75)
print("TRAINING FINAL PRODUCTION PRIORITY MODEL")
print("=" * 75)


print(
    "\nTraining model..."
)


priority_model.fit(
    X_train,
    y_train,
)


print(
    "Training completed successfully."
)


# =========================================================
# MODEL CAPABILITY CHECK
# =========================================================

print("\n" + "=" * 75)
print("MODEL CAPABILITY CHECK")
print("=" * 75)


has_predict = hasattr(
    priority_model,
    "predict",
)

has_predict_proba = hasattr(
    priority_model,
    "predict_proba",
)


print(
    f"\npredict()       : "
    f"{'YES' if has_predict else 'NO'}"
)

print(
    f"predict_proba() : "
    f"{'YES' if has_predict_proba else 'NO'}"
)


if not has_predict:

    raise RuntimeError(
        "Final model does not support predict()."
    )


if not has_predict_proba:

    raise RuntimeError(
        "Final model does not support "
        "predict_proba()."
    )


print(
    "\nPASS: Production model supports "
    "prediction and probability output."
)


# =========================================================
# MODEL CLASS CHECK
# =========================================================

print("\n" + "=" * 75)
print("MODEL CLASS CHECK")
print("=" * 75)


model_classes = (
    priority_model.classes_
    .tolist()
)


print(
    f"\nModel Classes : "
    f"{model_classes}"
)


if set(model_classes) != EXPECTED_PRIORITIES:

    raise RuntimeError(
        "Trained model contains "
        "unexpected classes."
    )


print(
    "\nPASS: Model classes are correct."
)


# =========================================================
# PRE-SAVE SANITY TESTS
# =========================================================

print("\n" + "=" * 75)
print("PRE-SAVE REAL-WORLD SANITY TEST")
print("=" * 75)


sanity_tests = [
    (
        "A live electrical wire has fallen "
        "across the road where people are walking."
    ),

    (
        "Several street lights have not been "
        "working for the past three nights."
    ),

    (
        "One street lamp is dim but still "
        "provides enough light."
    ),

    (
        "Floodwater is rising rapidly around "
        "several houses and residents cannot "
        "leave safely."
    ),

    (
        "Garbage collection has been missed "
        "for several days and waste is "
        "accumulating along the street."
    ),

    (
        "A small crack has appeared along "
        "the edge of a quiet side road."
    ),

    (
        "Dense smoke is entering nearby homes "
        "and residents are struggling to breathe."
    ),

    (
        "Water pressure has been very low "
        "for several houses since yesterday."
    ),
]


for complaint in sanity_tests:

    prediction = (
        priority_model.predict(
            [complaint]
        )[0]
    )

    probabilities = (
        priority_model.predict_proba(
            [complaint]
        )[0]
    )

    confidence = float(
        probabilities.max()
    )

    print(
        "\n---"
    )

    print(
        f"Complaint : {complaint}"
    )

    print(
        f"Priority  : {prediction}"
    )

    print(
        f"Confidence: {confidence:.4f}"
    )


# =========================================================
# CREATE MODEL DIRECTORY
# =========================================================

MODELS_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# =========================================================
# SAVE PRODUCTION MODEL
# =========================================================

print("\n" + "=" * 75)
print("SAVE FINAL PRODUCTION MODEL")
print("=" * 75)


joblib.dump(
    priority_model,
    OUTPUT_MODEL,
)


if not OUTPUT_MODEL.exists():

    raise RuntimeError(
        "Model save operation failed."
    )


model_size_bytes = (
    OUTPUT_MODEL.stat().st_size
)

model_size_mb = (
    model_size_bytes
    / (1024 * 1024)
)


print(
    f"\nModel saved successfully:\n"
    f"{OUTPUT_MODEL}"
)

print(
    f"\nModel Size: "
    f"{model_size_mb:.2f} MB"
)


# =========================================================
# RELOAD SAVED MODEL
# =========================================================

print("\n" + "=" * 75)
print("VERIFY SAVED MODEL")
print("=" * 75)


reloaded_model = joblib.load(
    OUTPUT_MODEL
)


print(
    "\nModel reloaded successfully."
)


# =========================================================
# RELOADED MODEL CAPABILITY CHECK
# =========================================================

if not hasattr(
    reloaded_model,
    "predict",
):

    raise RuntimeError(
        "Reloaded model does not "
        "support predict()."
    )


if not hasattr(
    reloaded_model,
    "predict_proba",
):

    raise RuntimeError(
        "Reloaded model does not "
        "support predict_proba()."
    )


# =========================================================
# RELOAD VERIFICATION TEST
# =========================================================

verification_complaint = (
    "A live electrical cable is sparking "
    "beside a crowded public walkway."
)


original_prediction = (
    priority_model.predict(
        [verification_complaint]
    )[0]
)


reloaded_prediction = (
    reloaded_model.predict(
        [verification_complaint]
    )[0]
)


original_probabilities = (
    priority_model.predict_proba(
        [verification_complaint]
    )[0]
)


reloaded_probabilities = (
    reloaded_model.predict_proba(
        [verification_complaint]
    )[0]
)


original_confidence = float(
    original_probabilities.max()
)


reloaded_confidence = float(
    reloaded_probabilities.max()
)


print(
    "\nVerification Complaint:"
)

print(
    verification_complaint
)


print(
    "\nOriginal Model Prediction:"
)

print(
    original_prediction
)


print(
    "\nReloaded Model Prediction:"
)

print(
    reloaded_prediction
)


print(
    "\nOriginal Confidence:"
)

print(
    f"{original_confidence:.4f}"
)


print(
    "\nReloaded Confidence:"
)

print(
    f"{reloaded_confidence:.4f}"
)


if (
    original_prediction
    != reloaded_prediction
):

    raise RuntimeError(
        "Reloaded model prediction "
        "does not match original model."
    )


confidence_difference = abs(
    original_confidence
    - reloaded_confidence
)


if confidence_difference > 1e-10:

    raise RuntimeError(
        "Reloaded model probability "
        "does not match original model."
    )


print(
    "\nPASS: Saved and reloaded model "
    "produces identical output."
)


# =========================================================
# FINAL SUMMARY
# =========================================================

print("\n" + "=" * 75)
print("FINAL PRIORITY PRODUCTION MODEL READY")
print("=" * 75)


print(
    f"\nTraining Dataset : "
    f"priority_training_dataset_v3.csv"
)

print(
    f"Training Records : "
    f"{len(train_df)}"
)

print(
    "Classifier       : "
    "Multinomial Naive Bayes"
)

print(
    "Features         : "
    "TF-IDF Unigrams + Bigrams"
)

print(
    f"Priority Classes : "
    f"{model_classes}"
)

print(
    "\npredict()        : YES"
)

print(
    "predict_proba()  : YES"
)

print(
    f"\nSaved Model:\n"
    f"{OUTPUT_MODEL}"
)

print(
    "\nIMPORTANT:"
)

print(
    "The final blind priority test dataset "
    "was NOT used to train this production model."
)

print(
    "\nFinal independent blind evaluation "
    "previously recorded:"
)

print(
    "Accuracy    : 0.8800"
)

print(
    "Macro F1    : 0.8804"
)

print(
    "High Recall : 0.9200"
)

print(
    "High -> Low : 0"
)

print(
    "\nProduction priority classifier "
    "has been trained, saved and "
    "successfully reloaded."
)