import pandas as pd
from pathlib import Path

from sklearn.model_selection import train_test_split
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

DATASET_PATH = Path(
    "../datasets/final_complaint_training_dataset_v2.csv"
)

RANDOM_STATE = 42
TEST_SIZE = 0.20

# =========================================================
# LOAD DATASET
# =========================================================

print("=" * 75)
print("COMPLAINT CATEGORY MODEL TRAINING")
print("=" * 75)

df = pd.read_csv(DATASET_PATH)

print(f"\nDataset Shape: {df.shape}")

print("\nCategory Distribution:")
print(
    df["category"]
    .value_counts()
    .sort_index()
)

# Keep required fields only
df = df[
    ["complaint_text", "category"]
].dropna()

X = df["complaint_text"].astype(str)
y = df["category"].astype(str)

# =========================================================
# TRAIN / TEST SPLIT
# =========================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=TEST_SIZE,
    random_state=RANDOM_STATE,
    stratify=y,
)

print("\n" + "=" * 75)
print("TRAIN / TEST SPLIT")
print("=" * 75)

print(f"Training Records : {len(X_train)}")
print(f"Testing Records  : {len(X_test)}")

print("\nTraining Distribution:")
print(
    y_train
    .value_counts()
    .sort_index()
)

print("\nTesting Distribution:")
print(
    y_test
    .value_counts()
    .sort_index()
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

trained_pipelines = {}

# =========================================================
# TRAIN AND EVALUATE
# =========================================================

for model_name, model in models.items():

    print("\n" + "=" * 75)
    print(model_name.upper())
    print("=" * 75)

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
            ("classifier", model),
        ]
    )

    # Train
    pipeline.fit(X_train, y_train)

    # Predict
    predictions = pipeline.predict(X_test)

    # Metrics
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

    print(f"\nAccuracy        : {accuracy:.4f}")
    print(f"Macro Precision : {precision:.4f}")
    print(f"Macro Recall    : {recall:.4f}")
    print(f"Macro F1-Score  : {f1:.4f}")

    print("\nClassification Report:")
    print(
        classification_report(
            y_test,
            predictions,
            digits=4,
            zero_division=0,
        )
    )

    print("Confusion Matrix:")
    print(
        confusion_matrix(
            y_test,
            predictions,
        )
    )

    results.append(
        {
            "Model": model_name,
            "Accuracy": accuracy,
            "Macro_Precision": precision,
            "Macro_Recall": recall,
            "Macro_F1": f1,
        }
    )

    trained_pipelines[model_name] = pipeline

# =========================================================
# MODEL COMPARISON
# =========================================================

results_df = pd.DataFrame(results)

results_df = results_df.sort_values(
    by="Macro_F1",
    ascending=False,
).reset_index(drop=True)

print("\n" + "=" * 75)
print("MODEL COMPARISON")
print("=" * 75)

print(
    results_df.to_string(
        index=False,
        float_format=lambda x: f"{x:.4f}",
    )
)

# =========================================================
# BEST MODEL
# =========================================================

best_model_name = results_df.iloc[0]["Model"]

print("\n" + "=" * 75)
print("BEST DEVELOPMENT MODEL")
print("=" * 75)

print(f"\nBest Model: {best_model_name}")
print(
    f"Macro F1 : "
    f"{results_df.iloc[0]['Macro_F1']:.4f}"
)

print(
    "\nNOTE:"
    "\nThese scores are development results based on the "
    "controlled augmented dataset."
    "\nA separate manually written unseen test set should "
    "be used before reporting final real-world performance."
)