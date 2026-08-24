import pandas as pd
import joblib
from pathlib import Path

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression

# =========================================================
# PATHS
# =========================================================

DATASET_PATH = Path(
    "../datasets/final_complaint_training_dataset_v2.csv"
)

MODEL_PATH = Path(
    "../models/complaint_classifier.joblib"
)

# =========================================================
# LOAD DATA
# =========================================================

print("=" * 70)
print("TRAINING FINAL COMPLAINT CLASSIFICATION MODEL")
print("=" * 70)

df = pd.read_csv(DATASET_PATH)

df = df[
    ["complaint_text", "category"]
].dropna()

X = df["complaint_text"].astype(str)
y = df["category"].astype(str)

print(f"\nTraining Records: {len(df)}")

print("\nCategory Distribution:")
print(
    y.value_counts().sort_index()
)

# =========================================================
# FINAL PIPELINE
# =========================================================

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
            LogisticRegression(
                max_iter=2000,
                random_state=42,
            ),
        ),
    ]
)

# =========================================================
# TRAIN
# =========================================================

print("\nTraining final Logistic Regression model...")

pipeline.fit(X, y)

print("Training completed successfully.")

# =========================================================
# SAVE MODEL
# =========================================================

MODEL_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)

joblib.dump(
    pipeline,
    MODEL_PATH
)

print("\n" + "=" * 70)
print("FINAL MODEL SAVED")
print("=" * 70)

print(f"\nModel Path:\n{MODEL_PATH}")

# =========================================================
# QUICK PREDICTION TEST
# =========================================================

test_complaints = [
    "There is a large pothole in front of the school.",
    "We have had no water since yesterday morning.",
    "The roadside drain is blocked and overflowing.",
    "Garbage has not been collected for several days.",
    "The street lights in our lane are not working.",
    "Thick smoke from a nearby workshop is affecting residents.",
]

predictions = pipeline.predict(
    test_complaints
)

probabilities = pipeline.predict_proba(
    test_complaints
)

print("\nQuick Prediction Test:")

for text, prediction, probability in zip(
    test_complaints,
    predictions,
    probabilities,
):
    confidence = probability.max()

    print("\nComplaint:")
    print(text)

    print("Prediction:")
    print(prediction)

    print(
        "Confidence:",
        round(float(confidence), 4)
    )