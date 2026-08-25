import pandas as pd
from pathlib import Path

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC

from sklearn.model_selection import (
    StratifiedKFold,
    GridSearchCV,
)

from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    classification_report,
    confusion_matrix,
)


# =========================================================
# CONFIGURATION
# =========================================================

TRAIN_DATASET = Path(
    "../datasets/final_complaint_training_dataset_v3.csv"
)

RANDOM_STATE = 42

CV_FOLDS = 5


# =========================================================
# LOAD V3 TRAINING DATASET
# =========================================================

print("=" * 75)
print("CATEGORY MODEL V3 - HYPERPARAMETER TUNING")
print("=" * 75)

df = pd.read_csv(TRAIN_DATASET)

df = df[
    [
        "complaint_text",
        "category",
    ]
].dropna()

df["complaint_text"] = (
    df["complaint_text"]
    .astype(str)
    .str.strip()
)

df["category"] = (
    df["category"]
    .astype(str)
    .str.strip()
)


print(
    f"\nDataset Shape : {df.shape}"
)

print(
    "\nCategory Distribution:"
)

print(
    df["category"]
    .value_counts()
    .sort_index()
)


# =========================================================
# INPUT / TARGET
# =========================================================

X = df["complaint_text"]

y = df["category"]


# =========================================================
# STRATIFIED CROSS VALIDATION
# =========================================================

cv = StratifiedKFold(
    n_splits=CV_FOLDS,
    shuffle=True,
    random_state=RANDOM_STATE,
)


# =========================================================
# BASE PIPELINE
# =========================================================

pipeline = Pipeline(
    [
        (
            "tfidf",
            TfidfVectorizer(
                lowercase=True,
                strip_accents="unicode",
                sublinear_tf=True,
            ),
        ),
        (
            "classifier",
            LinearSVC(
                random_state=RANDOM_STATE,
            ),
        ),
    ]
)


# =========================================================
# PARAMETER GRID
# =========================================================

param_grid = {
    "tfidf__ngram_range": [
        (1, 1),
        (1, 2),
        (1, 3),
    ],

    "tfidf__min_df": [
        1,
        2,
    ],

    "tfidf__max_df": [
        0.95,
        1.0,
    ],

    "tfidf__max_features": [
        None,
        30000,
    ],

    "classifier__C": [
        0.5,
        1.0,
        1.5,
        2.0,
    ],
}


# =========================================================
# GRID SEARCH
# =========================================================

print("\n" + "=" * 75)
print("STARTING GRID SEARCH")
print("=" * 75)

print(
    "\nImportant:"
)

print(
    "The independent 300-record unseen test dataset "
    "is NOT used during hyperparameter tuning."
)

print(
    f"\nCross Validation Folds : {CV_FOLDS}"
)

print(
    "Optimization Metric   : Macro F1"
)


grid_search = GridSearchCV(
    estimator=pipeline,

    param_grid=param_grid,

    scoring="f1_macro",

    cv=cv,

    n_jobs=-1,

    verbose=2,

    return_train_score=True,

    refit=True,
)


grid_search.fit(
    X,
    y,
)


# =========================================================
# BEST PARAMETERS
# =========================================================

print("\n" + "=" * 75)
print("BEST HYPERPARAMETERS")
print("=" * 75)

for parameter, value in (
    grid_search.best_params_.items()
):
    print(
        f"{parameter}: {value}"
    )


print(
    "\nBest Cross-Validated Macro F1:"
)

print(
    f"{grid_search.best_score_:.4f}"
)


# =========================================================
# GRID SEARCH RESULTS
# =========================================================

results_df = pd.DataFrame(
    grid_search.cv_results_
)

results_df = results_df.sort_values(
    by="mean_test_score",
    ascending=False,
).reset_index(drop=True)


print("\n" + "=" * 75)
print("TOP 15 MODEL CONFIGURATIONS")
print("=" * 75)


display_columns = [
    "mean_test_score",
    "std_test_score",
    "mean_train_score",
    "param_classifier__C",
    "param_tfidf__ngram_range",
    "param_tfidf__min_df",
    "param_tfidf__max_df",
    "param_tfidf__max_features",
]


print(
    results_df[
        display_columns
    ]
    .head(15)
    .to_string(
        index=False,
        float_format=lambda x: f"{x:.4f}",
    )
)


# =========================================================
# CROSS-VALIDATED OUT-OF-FOLD EVALUATION
# =========================================================

print("\n" + "=" * 75)
print("OUT-OF-FOLD VALIDATION OF BEST CONFIGURATION")
print("=" * 75)


best_params = grid_search.best_params_


best_pipeline = Pipeline(
    [
        (
            "tfidf",
            TfidfVectorizer(
                lowercase=True,
                strip_accents="unicode",
                sublinear_tf=True,

                ngram_range=best_params[
                    "tfidf__ngram_range"
                ],

                min_df=best_params[
                    "tfidf__min_df"
                ],

                max_df=best_params[
                    "tfidf__max_df"
                ],

                max_features=best_params[
                    "tfidf__max_features"
                ],
            ),
        ),
        (
            "classifier",
            LinearSVC(
                C=best_params[
                    "classifier__C"
                ],

                random_state=RANDOM_STATE,
            ),
        ),
    ]
)


# =========================================================
# MANUAL OUT-OF-FOLD PREDICTIONS
# =========================================================

oof_predictions = pd.Series(
    index=df.index,
    dtype="object",
)


for fold_number, (
    train_index,
    validation_index,
) in enumerate(
    cv.split(X, y),
    start=1,
):

    print(
        f"\nTraining Fold "
        f"{fold_number}/{CV_FOLDS}"
    )

    X_train = X.iloc[
        train_index
    ]

    y_train = y.iloc[
        train_index
    ]

    X_validation = X.iloc[
        validation_index
    ]

    fold_pipeline = Pipeline(
        [
            (
                "tfidf",
                TfidfVectorizer(
                    lowercase=True,
                    strip_accents="unicode",
                    sublinear_tf=True,

                    ngram_range=best_params[
                        "tfidf__ngram_range"
                    ],

                    min_df=best_params[
                        "tfidf__min_df"
                    ],

                    max_df=best_params[
                        "tfidf__max_df"
                    ],

                    max_features=best_params[
                        "tfidf__max_features"
                    ],
                ),
            ),
            (
                "classifier",
                LinearSVC(
                    C=best_params[
                        "classifier__C"
                    ],

                    random_state=RANDOM_STATE,
                ),
            ),
        ]
    )

    fold_pipeline.fit(
        X_train,
        y_train,
    )

    fold_predictions = (
        fold_pipeline.predict(
            X_validation
        )
    )

    oof_predictions.iloc[
        validation_index
    ] = fold_predictions


# =========================================================
# OOF METRICS
# =========================================================

accuracy = accuracy_score(
    y,
    oof_predictions,
)

precision, recall, f1, _ = (
    precision_recall_fscore_support(
        y,
        oof_predictions,

        average="macro",

        zero_division=0,
    )
)


print(
    f"\nOOF Accuracy        : "
    f"{accuracy:.4f}"
)

print(
    f"OOF Macro Precision : "
    f"{precision:.4f}"
)

print(
    f"OOF Macro Recall    : "
    f"{recall:.4f}"
)

print(
    f"OOF Macro F1        : "
    f"{f1:.4f}"
)


# =========================================================
# CLASSIFICATION REPORT
# =========================================================

print("\nClassification Report:")

print(
    classification_report(
        y,
        oof_predictions,
        digits=4,
        zero_division=0,
    )
)


# =========================================================
# CONFUSION MATRIX
# =========================================================

labels = sorted(
    y.unique()
)


matrix = confusion_matrix(
    y,
    oof_predictions,
    labels=labels,
)


matrix_df = pd.DataFrame(
    matrix,
    index=labels,
    columns=labels,
)


print(
    "\nConfusion Matrix:"
)

print(
    matrix_df
)


# =========================================================
# MISCLASSIFIED EXAMPLES
# =========================================================

error_df = pd.DataFrame(
    {
        "complaint_text":
            X.values,

        "actual":
            y.values,

        "predicted":
            oof_predictions.values,
    }
)


errors = error_df[
    error_df["actual"]
    != error_df["predicted"]
]


print(
    f"\nMisclassified OOF Records: "
    f"{len(errors)}"
)


if len(errors) > 0:

    print(
        "\nFirst 30 OOF Errors:"
    )

    print(
        errors
        .head(30)
        .to_string(
            index=False
        )
    )


# =========================================================
# MISCLASSIFICATION PAIRS
# =========================================================

if len(errors) > 0:

    error_pairs = (
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
            by="count",
            ascending=False,
        )
    )

    print(
        "\nMost Common "
        "Misclassification Pairs:"
    )

    print(
        error_pairs
        .head(20)
        .to_string(
            index=False
        )
    )


# =========================================================
# FINAL SUMMARY
# =========================================================

print("\n" + "=" * 75)
print("TUNING SUMMARY")
print("=" * 75)


print(
    "\nBest Model:"
)

print(
    "TF-IDF + Linear SVM"
)


print(
    "\nBest Parameters:"
)

for parameter, value in (
    best_params.items()
):
    print(
        f"{parameter}: {value}"
    )


print(
    "\nBest GridSearch "
    f"Macro F1 : "
    f"{grid_search.best_score_:.4f}"
)


print(
    f"OOF Accuracy          : "
    f"{accuracy:.4f}"
)

print(
    f"OOF Macro F1          : "
    f"{f1:.4f}"
)


print("\n" + "=" * 75)
print("NEXT STEP")
print("=" * 75)


print(
    "\nDo NOT save the final production "
    "model yet."
)

print(
    "Next, evaluate this selected "
    "configuration exactly once against "
    "the independent 300-record unseen "
    "test dataset."
)