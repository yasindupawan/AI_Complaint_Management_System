from typing import List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from predict_category import predict_complaint
from duplicate_detector import find_best_duplicate


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="AI Complaint Classification Service",
    description=(
        "Multilingual complaint classification, priority "
        "prediction, and semantic duplicate detection service "
        "for English, Sinhala and Tamil complaints."
    ),
    version="3.0.0",
)


# =========================================================
# REQUEST MODELS
# =========================================================

class ComplaintRequest(BaseModel):
    complaint_text: str = Field(
        ...,
        min_length=3,
        max_length=2000,
    )


class ExistingComplaint(BaseModel):
    id: str

    text: str = Field(
        ...,
        min_length=3,
        max_length=4000,
    )


class DuplicateRequest(BaseModel):
    complaint_text: str = Field(
        ...,
        min_length=3,
        max_length=4000,
    )

    existing_complaints: List[ExistingComplaint] = Field(
        default_factory=list
    )

    threshold: Optional[float] = Field(
        default=0.75,
        ge=0.0,
        le=1.0,
    )


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {
        "success": True,
        "message": (
            "AI Complaint Classification Service is running"
        ),
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health():
    return {
        "success": True,
        "status": "healthy",

        "version": "3.0.0",

        "models": {
            "category":
                "TF-IDF + Logistic Regression",

            "priority":
                "TF-IDF + Calibrated Linear SVM",

            "duplicateDetection":
                "Sentence Transformer all-MiniLM-L6-v2",
        },

        "supportedLanguages": [
            "english",
            "sinhala",
            "tamil",
        ],

        "supportedCategories": [
            "roads",
            "garbage",
            "water_supply",
            "electricity",
            "drainage",
            "environment",
        ],

        "supportedPriorities": [
            "low",
            "medium",
            "high",
        ],
    }


# =========================================================
# FULL COMPLAINT PREDICTION
# =========================================================

@app.post("/predict-category")
def classify_complaint(
    request: ComplaintRequest
):
    try:
        result = predict_complaint(
            request.complaint_text
        )

        return {
            "success": True,

            "prediction": {
                "originalText":
                    result["originalText"],

                "detectedLanguage":
                    result["detectedLanguage"],

                "translatedText":
                    result["translatedText"],

                "category":
                    result["category"],

                "categoryConfidence":
                    result["categoryConfidence"],

                "priority":
                    result["priority"],

                "priorityConfidence":
                    result["priorityConfidence"],

                "requiresManualReview":
                    result["requiresManualReview"],
            },
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:
        print(
            f"Prediction service error: {error}"
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to classify complaint",
        )


# =========================================================
# DUPLICATE DETECTION
# =========================================================

@app.post("/detect-duplicate")
def detect_duplicate(
    request: DuplicateRequest
):
    try:
        existing_complaints = [
            {
                "id": complaint.id,
                "text": complaint.text,
            }
            for complaint
            in request.existing_complaints
        ]

        result = find_best_duplicate(
            new_complaint=
                request.complaint_text,

            existing_complaints=
                existing_complaints,

            threshold=
                request.threshold,
        )

        return {
            "success": True,

            "duplicate": {
                "isPotentialDuplicate":
                    result[
                        "isPotentialDuplicate"
                    ],

                "matchedComplaintId":
                    result[
                        "matchedComplaintId"
                    ],

                "similarityScore":
                    result[
                        "similarityScore"
                    ],

                "threshold":
                    result["threshold"],
            },
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:
        print(
            f"Duplicate detection error: {error}"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to perform duplicate detection"
            ),
        )