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
    "../datasets/final_complaint_training_dataset_v2.csv"
)

TEST_DATASET = Path(
    "../datasets/manual_unseen_test_dataset.csv"
)

RANDOM_STATE = 42

# =========================================================
# LOAD DATA
# =========================================================

print("=" * 75)
print("INDEPENDENT UNSEEN MODEL EVALUATION")
print("=" * 75)

train_df = pd.read_csv(TRAIN_DATASET)
test_df = pd.read_csv(TEST_DATASET)

train_df = train_df[
    ["complaint_text", "category"]
].dropna()

test_df = test_df[
    ["complaint_text", "category"]
].dropna()

print(f"\nTraining Dataset Shape : {train_df.shape}")
print(f"Unseen Test Shape      : {test_df.shape}")

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

X_train = train_df["complaint_text"].astype(str)
y_train = train_df["category"].astype(str)

X_test = test_df["complaint_text"].astype(str)
y_test = test_df["category"].astype(str)

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
trained_models = {}

# =========================================================
# TRAIN + EVALUATE
# =========================================================

for model_name, classifier in models.items():

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
            ("classifier", classifier),
        ]
    )

    pipeline.fit(X_train, y_train)

    predictions = pipeline.predict(X_test)

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

    # Show misclassified records
    error_df = pd.DataFrame(
        {
            "complaint_text": X_test.values,
            "actual": y_test.values,
            "predicted": predictions,
        }
    )

    errors = error_df[
        error_df["actual"] != error_df["predicted"]
    ]

    print(
        f"\nMisclassified Records: {len(errors)}"
    )

    if len(errors) > 0:
        print(
            errors.head(20).to_string(
                index=False
            )
        )

    results.append(
        {
            "Model": model_name,
            "Accuracy": accuracy,
            "Macro_Precision": precision,
            "Macro_Recall": recall,
            "Macro_F1": f1,
            "Misclassified": len(errors),
        }
    )

    trained_models[model_name] = pipeline

# =========================================================
# COMPARISON
# =========================================================

results_df = pd.DataFrame(results)

results_df = results_df.sort_values(
    by=[
        "Macro_F1",
        "Accuracy",
    ],
    ascending=False,
).reset_index(drop=True)

print("\n" + "=" * 75)
print("UNSEEN MODEL COMPARISON")
print("=" * 75)

print(
    results_df.to_string(
        index=False,
        float_format=lambda x: f"{x:.4f}",
    )
)

# =========================================================
# FINAL MODEL
# =========================================================

best_model_name = results_df.iloc[0]["Model"]

print("\n" + "=" * 75)
print("BEST MODEL ON INDEPENDENT UNSEEN DATA")
print("=" * 75)

print(f"\nBest Model : {best_model_name}")
print(
    f"Accuracy   : "
    f"{results_df.iloc[0]['Accuracy']:.4f}"
)
print(
    f"Macro F1   : "
    f"{results_df.iloc[0]['Macro_F1']:.4f}"
)
print(
    f"Errors     : "
    f"{int(results_df.iloc[0]['Misclassified'])}"
)

print(
    "\nThis evaluation uses a separately authored "
    "300-record test set that was not used for "
    "training."
)