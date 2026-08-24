import re
import joblib
from pathlib import Path
from deep_translator import GoogleTranslator


# =========================================================
# MODEL PATHS
# =========================================================

CATEGORY_MODEL_PATH = Path(
    "../models/complaint_classifier.joblib"
)

PRIORITY_MODEL_PATH = Path(
    "../models/priority_classifier_calibrated.joblib"
)


# =========================================================
# LOAD MODELS
# =========================================================

category_model = joblib.load(
    CATEGORY_MODEL_PATH
)

priority_model = joblib.load(
    PRIORITY_MODEL_PATH
)


# =========================================================
# LANGUAGE DETECTION
# =========================================================

def detect_language(text):

    text = str(text).strip()

    if not text:
        return "unknown"

    sinhala_chars = 0
    tamil_chars = 0
    latin_chars = 0

    for char in text:

        code = ord(char)

        # Sinhala Unicode block
        if 0x0D80 <= code <= 0x0DFF:
            sinhala_chars += 1

        # Tamil Unicode block
        elif 0x0B80 <= code <= 0x0BFF:
            tamil_chars += 1

        # English / Latin
        elif char.isascii() and char.isalpha():
            latin_chars += 1

    if sinhala_chars > 0:
        return "si"

    if tamil_chars > 0:
        return "ta"

    if latin_chars > 0:
        return "en"

    return "unknown"


# =========================================================
# TRANSLATION
# =========================================================

def translate_to_english(
    text,
    language
):

    if language == "en":
        return text

    if language not in [
        "si",
        "ta",
    ]:
        raise ValueError(
            "Unsupported complaint language"
        )

    translated = GoogleTranslator(
        source=language,
        target="en"
    ).translate(text)

    if not translated:
        raise ValueError(
            "Complaint translation failed"
        )

    return translated


# =========================================================
# TEXT CLEANING
# =========================================================

def clean_text(text):

    text = str(text)

    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text.strip()


# =========================================================
# CATEGORY PREDICTION
# =========================================================

def predict_category_from_english(
    english_text
):

    predicted_category = (
        category_model.predict(
            [english_text]
        )[0]
    )

    probabilities = (
        category_model.predict_proba(
            [english_text]
        )[0]
    )

    category_confidence = float(
        probabilities.max()
    )

    return (
        str(predicted_category),
        category_confidence,
    )


# =========================================================
# PRIORITY PREDICTION
# =========================================================

def predict_priority_from_english(
    english_text
):

    predicted_priority = (
        priority_model.predict(
            [english_text]
        )[0]
    )

    probabilities = (
        priority_model.predict_proba(
            [english_text]
        )[0]
    )

    priority_confidence = float(
        probabilities.max()
    )

    return (
        str(predicted_priority),
        priority_confidence,
    )


# =========================================================
# FULL COMPLAINT PREDICTION
# =========================================================

def predict_complaint(
    complaint_text
):

    # -----------------------------------------------------
    # Clean original complaint
    # -----------------------------------------------------

    complaint_text = clean_text(
        complaint_text
    )

    if len(complaint_text) < 3:
        raise ValueError(
            "Complaint text is too short"
        )

    # -----------------------------------------------------
    # Detect language
    # -----------------------------------------------------

    detected_language = (
        detect_language(
            complaint_text
        )
    )

    if detected_language == "unknown":
        raise ValueError(
            "Unable to detect complaint language"
        )

    # -----------------------------------------------------
    # Translate to English
    # -----------------------------------------------------

    english_text = (
        translate_to_english(
            complaint_text,
            detected_language
        )
    )

    english_text = clean_text(
        english_text
    )

    if len(english_text) < 3:
        raise ValueError(
            "Translated complaint text is too short"
        )

    # -----------------------------------------------------
    # Category prediction
    # -----------------------------------------------------

    (
        predicted_category,
        category_confidence,
    ) = predict_category_from_english(
        english_text
    )

    # -----------------------------------------------------
    # Priority prediction
    # -----------------------------------------------------

    (
        predicted_priority,
        priority_confidence,
    ) = predict_priority_from_english(
        english_text
    )

    # -----------------------------------------------------
    # Manual review
    # -----------------------------------------------------

    CATEGORY_REVIEW_THRESHOLD = 0.60
    PRIORITY_REVIEW_THRESHOLD = 0.60

    category_requires_review = (
        category_confidence
        < CATEGORY_REVIEW_THRESHOLD
    )

    priority_requires_review = (
        priority_confidence
        < PRIORITY_REVIEW_THRESHOLD
    )

    requires_manual_review = (
        category_requires_review
        or
        priority_requires_review
    )

    # -----------------------------------------------------
    # Final result
    # -----------------------------------------------------

    return {
        "originalText":
            complaint_text,

        "detectedLanguage":
            detected_language,

        "translatedText":
            english_text,

        "category":
            predicted_category,

        "categoryConfidence":
            round(
                category_confidence,
                4
            ),

        "priority":
            predicted_priority,

        "priorityConfidence":
            round(
                priority_confidence,
                4
            ),

        "requiresManualReview":
            bool(
                requires_manual_review
            ),
    }


# =========================================================
# BACKWARD COMPATIBILITY
# =========================================================

def predict_category(
    complaint_text
):

    """
    Backward-compatible function for the
    existing FastAPI integration.
    """

    result = predict_complaint(
        complaint_text
    )

    return {
        "originalText":
            result["originalText"],

        "detectedLanguage":
            result["detectedLanguage"],

        "translatedText":
            result["translatedText"],

        "category":
            result["category"],

        # Existing API expects "confidence"
        "confidence":
            result[
                "categoryConfidence"
            ],

        "priority":
            result["priority"],

        "priorityConfidence":
            result[
                "priorityConfidence"
            ],

        "requiresManualReview":
            result[
                "requiresManualReview"
            ],
    }


# =========================================================
# LOCAL TEST
# =========================================================

if __name__ == "__main__":

    test_complaints = [

        "There is a large pothole near our school.",

        "අපේ ගෙවල් වලට ඊයේ ඉඳන් වතුර එන්නේ නැහැ.",

        "எங்கள் வீட்டுக்கு அருகில் உள்ள வடிகால் அடைத்துள்ளது.",

        "Garbage has not been collected from our street for a week.",

        "අපේ පාරේ විදුලි කම්බියක් බිමට වැටිලා තියෙනවා.",

        "அருகிலுள்ள தொழிற்சாலையிலிருந்து அதிக புகை வருகிறது.",

        "A live electrical wire is hanging beside the school entrance.",

        "One street lamp near our house is dim but still working.",
    ]

    for complaint in test_complaints:

        try:

            result = predict_complaint(
                complaint
            )

            print(
                "\n" + "=" * 70
            )

            print("Original:")
            print(
                result[
                    "originalText"
                ]
            )

            print(
                "\nDetected Language:"
            )

            print(
                result[
                    "detectedLanguage"
                ]
            )

            print(
                "\nEnglish Text:"
            )

            print(
                result[
                    "translatedText"
                ]
            )

            print(
                "\nPredicted Category:"
            )

            print(
                result[
                    "category"
                ]
            )

            print(
                "\nCategory Confidence:"
            )

            print(
                result[
                    "categoryConfidence"
                ]
            )

            print(
                "\nPredicted Priority:"
            )

            print(
                result[
                    "priority"
                ]
            )

            print(
                "\nPriority Confidence:"
            )

            print(
                result[
                    "priorityConfidence"
                ]
            )

            print(
                "\nRequires Manual Review:"
            )

            print(
                result[
                    "requiresManualReview"
                ]
            )

        except Exception as error:

            print(
                "\nPrediction Error:"
            )

            print(error)