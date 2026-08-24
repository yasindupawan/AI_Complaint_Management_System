import pandas as pd
import joblib
from pathlib import Path

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC

# =========================================================
# PATHS
# =========================================================

DATASET_PATH = Path(
    "../datasets/priority/priority_training_dataset_v2.csv"
)

MODEL_PATH = Path(
    "../models/priority_classifier.joblib"
)

# =========================================================
# LOAD DATASET
# =========================================================

print("=" * 70)
print("TRAINING FINAL PRIORITY CLASSIFICATION MODEL")
print("=" * 70)

df = pd.read_csv(DATASET_PATH)

df = df[
    ["complaint_text", "priority"]
].dropna()

X = df["complaint_text"].astype(str)
y = df["priority"].astype(str)

print(f"\nTraining Records: {len(df)}")

print("\nPriority Distribution:")
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
            LinearSVC(
                random_state=42,
            ),
        ),
    ]
)

# =========================================================
# TRAIN
# =========================================================

print(
    "\nTraining final Linear SVM priority model..."
)

pipeline.fit(
    X,
    y
)

print(
    "Priority model training completed successfully."
)

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
print("FINAL PRIORITY MODEL SAVED")
print("=" * 70)

print(
    f"\nModel Path:\n{MODEL_PATH}"
)

# =========================================================
# QUICK TEST
# =========================================================

test_complaints = [
    "One street lamp near our house is dim but still working.",

    "Several potholes on the main road are making vehicles slow down.",

    "An exposed electrical wire is hanging beside the school entrance.",

    "Garbage has not been collected for several days.",

    "A major water pipe has burst and water is entering nearby houses.",

    "A small amount of litter is scattered near the bus stop.",
]

predictions = pipeline.predict(
    test_complaints
)

decision_scores = pipeline.decision_function(
    test_complaints
)

classes = pipeline.named_steps[
    "classifier"
].classes_

print("\nQuick Priority Prediction Test:")

for text, prediction, scores in zip(
    test_complaints,
    predictions,
    decision_scores,
):

    predicted_index = list(
        classes
    ).index(
        prediction
    )

    raw_score = float(
        scores[predicted_index]
    )

    print("\nComplaint:")
    print(text)

    print("Priority:")
    print(prediction)

    print("Raw Decision Score:")
    print(
        round(
            raw_score,
            4
        )
    )