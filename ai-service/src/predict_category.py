import os
import re
import time
import uuid
from pathlib import Path

import joblib
import requests
from dotenv import load_dotenv


# =========================================================
# CONFIGURATION
# =========================================================

CATEGORY_REVIEW_THRESHOLD = 0.60
PRIORITY_REVIEW_THRESHOLD = 0.60

TRANSLATION_MAX_RETRIES = 3
TRANSLATION_RETRY_DELAY = 1.0
TRANSLATION_CHUNK_SIZE = 450
TRANSLATION_TIMEOUT = 15

SUPPORTED_LANGUAGES = {
    "si",
    "ta",
    "en",
}


# =========================================================
# BASE PATHS
# =========================================================

CURRENT_DIR = Path(__file__).resolve().parent

AI_SERVICE_DIR = CURRENT_DIR.parent

PROJECT_ROOT = AI_SERVICE_DIR.parent

MODELS_DIR = (
    AI_SERVICE_DIR
    / "models"
)


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

PROJECT_ENV_PATH = (
    PROJECT_ROOT
    / ".env"
)

AI_SERVICE_ENV_PATH = (
    AI_SERVICE_DIR
    / ".env"
)


if PROJECT_ENV_PATH.exists():

    load_dotenv(
        PROJECT_ENV_PATH
    )

elif AI_SERVICE_ENV_PATH.exists():

    load_dotenv(
        AI_SERVICE_ENV_PATH
    )

else:

    load_dotenv()


# =========================================================
# AZURE TRANSLATOR CONFIGURATION
# =========================================================

AZURE_TRANSLATOR_KEY = (
    os.getenv(
        "AZURE_TRANSLATOR_KEY",
        "",
    )
    .strip()
)

AZURE_TRANSLATOR_REGION = (
    os.getenv(
        "AZURE_TRANSLATOR_REGION",
        "global",
    )
    .strip()
    .lower()
)

AZURE_TRANSLATOR_ENDPOINT = (
    os.getenv(
        "AZURE_TRANSLATOR_ENDPOINT",
        "https://api.cognitive.microsofttranslator.com/",
    )
    .strip()
    .rstrip("/")
)


# =========================================================
# VALIDATE AZURE CONFIGURATION
# =========================================================

if not AZURE_TRANSLATOR_KEY:

    raise EnvironmentError(
        "AZURE_TRANSLATOR_KEY is missing. "
        "Add it to the project .env file."
    )


if not AZURE_TRANSLATOR_ENDPOINT:

    raise EnvironmentError(
        "AZURE_TRANSLATOR_ENDPOINT is missing."
    )


if not AZURE_TRANSLATOR_ENDPOINT.startswith(
    "https://"
):

    raise EnvironmentError(
        "AZURE_TRANSLATOR_ENDPOINT must use HTTPS."
    )


# =========================================================
# MODEL PATHS
# =========================================================

CATEGORY_MODEL_PATH = (
    MODELS_DIR
    / "complaint_classifier.joblib"
)

PRIORITY_MODEL_PATH = (
    MODELS_DIR
    / "priority_classifier_v3.joblib"
)


# =========================================================
# LOAD MODELS
# =========================================================

if not CATEGORY_MODEL_PATH.exists():

    raise FileNotFoundError(
        f"Category model not found: "
        f"{CATEGORY_MODEL_PATH}"
    )


if not PRIORITY_MODEL_PATH.exists():

    raise FileNotFoundError(
        f"Priority model not found: "
        f"{PRIORITY_MODEL_PATH}"
    )


print(
    "Loading category model..."
)

category_model = joblib.load(
    CATEGORY_MODEL_PATH
)

print(
    "Category model loaded."
)


print(
    "Loading priority model..."
)

priority_model = joblib.load(
    PRIORITY_MODEL_PATH
)

print(
    "Priority model loaded."
)


# =========================================================
# MODEL CAPABILITY VALIDATION
# =========================================================

if not hasattr(
    category_model,
    "predict",
):

    raise AttributeError(
        "Category model does not "
        "support predict()."
    )


if not hasattr(
    category_model,
    "predict_proba",
):

    raise AttributeError(
        "Category model does not "
        "support predict_proba()."
    )


if not hasattr(
    priority_model,
    "predict",
):

    raise AttributeError(
        "Priority model does not "
        "support predict()."
    )


if not hasattr(
    priority_model,
    "predict_proba",
):

    raise AttributeError(
        "Priority model does not "
        "support predict_proba()."
    )


# =========================================================
# HTTP SESSION
# =========================================================

translation_session = (
    requests.Session()
)


# =========================================================
# TEXT CLEANING
# =========================================================

def clean_text(text):
    """
    Normalize whitespace while preserving
    the original complaint meaning.
    """

    if text is None:
        return ""

    text = str(text)

    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text.strip()


# =========================================================
# LANGUAGE DETECTION
# =========================================================

def detect_language(text):
    """
    Detect Sinhala, Tamil or English
    using Unicode character ranges.

    Returns:
        si
        ta
        en
        unknown
    """

    text = clean_text(
        text
    )

    if not text:
        return "unknown"

    sinhala_chars = 0
    tamil_chars = 0
    latin_chars = 0

    for char in text:

        code = ord(
            char
        )

        # Sinhala Unicode block
        if (
            0x0D80
            <= code
            <= 0x0DFF
        ):
            sinhala_chars += 1

        # Tamil Unicode block
        elif (
            0x0B80
            <= code
            <= 0x0BFF
        ):
            tamil_chars += 1

        # English / Latin
        elif (
            char.isascii()
            and
            char.isalpha()
        ):
            latin_chars += 1


    script_counts = {
        "si":
            sinhala_chars,

        "ta":
            tamil_chars,

        "en":
            latin_chars,
    }


    detected = max(
        script_counts,
        key=script_counts.get,
    )


    if (
        script_counts[
            detected
        ]
        == 0
    ):
        return "unknown"


    return detected


# =========================================================
# TRANSLATION RESPONSE VALIDATION
# =========================================================

def is_valid_translation(
    translated_text,
    original_text,
    language,
):
    """
    Validate translated English output
    before sending it to ML models.
    """

    if translated_text is None:
        return False


    translated_text = clean_text(
        translated_text
    )

    original_text = clean_text(
        original_text
    )


    if len(
        translated_text
    ) < 3:

        return False


    # English complaint does not require translation.
    if language == "en":

        return True


    latin_letters = sum(
        1
        for character
        in translated_text
        if (
            character.isascii()
            and
            character.isalpha()
        )
    )


    if latin_letters < 3:

        return False


    # Translation should not simply return
    # unchanged Sinhala/Tamil input.

    if (
        translated_text
        ==
        original_text
    ):

        return False


    source_script_chars = sum(
        1
        for character
        in translated_text
        if (
            (
                0x0D80
                <= ord(character)
                <= 0x0DFF
            )
            or
            (
                0x0B80
                <= ord(character)
                <= 0x0BFF
            )
        )
    )


    if (
        source_script_chars
        >
        latin_letters
    ):

        return False


    return True


# =========================================================
# BUILD AZURE TRANSLATOR HEADERS
# =========================================================

def get_azure_translation_headers():
    """
    Build Azure Translator request headers.

    For a single-service Global Translator
    resource, the region header is optional.

    For regional resources, the region header
    is included automatically.
    """

    headers = {
        "Ocp-Apim-Subscription-Key":
            AZURE_TRANSLATOR_KEY,

        "Content-Type":
            "application/json",

        "X-ClientTraceId":
            str(
                uuid.uuid4()
            ),
    }


    if (
        AZURE_TRANSLATOR_REGION
        and
        AZURE_TRANSLATOR_REGION
        != "global"
    ):

        headers[
            "Ocp-Apim-Subscription-Region"
        ] = (
            AZURE_TRANSLATOR_REGION
        )


    return headers


# =========================================================
# AZURE TRANSLATION REQUEST
# =========================================================

def attempt_translation(
    text,
    source_language,
):
    """
    Perform one Azure AI Translator request.
    """

    text = clean_text(
        text
    )


    if not text:

        raise ValueError(
            "Translation text is empty"
        )


    if (
        source_language
        not in [
            "si",
            "ta",
        ]
    ):

        raise ValueError(
            "Unsupported Azure translation "
            f"source language: "
            f"{source_language}"
        )


    translation_url = (
        f"{AZURE_TRANSLATOR_ENDPOINT}"
        f"/translate"
    )


    params = {
        "api-version":
            "3.0",

        "from":
            source_language,

        "to":
            "en",
    }


    headers = (
        get_azure_translation_headers()
    )


    body = [
        {
            "Text":
                text
        }
    ]


    response = (
        translation_session.post(
            translation_url,
            params=params,
            headers=headers,
            json=body,
            timeout=TRANSLATION_TIMEOUT,
        )
    )


    # -----------------------------------------------------
    # HANDLE AZURE HTTP ERRORS
    # -----------------------------------------------------

    if response.status_code != 200:

        safe_message = (
            "Azure Translator request failed "
            f"with HTTP "
            f"{response.status_code}"
        )


        try:

            error_json = (
                response.json()
            )


            azure_error = (
                error_json.get(
                    "error",
                    {}
                )
            )


            error_code = (
                azure_error.get(
                    "code"
                )
            )


            error_message = (
                azure_error.get(
                    "message"
                )
            )


            if error_code:

                safe_message += (
                    f" | Code: "
                    f"{error_code}"
                )


            if error_message:

                safe_message += (
                    f" | Message: "
                    f"{error_message}"
                )


        except Exception:

            pass


        raise RuntimeError(
            safe_message
        )


    # -----------------------------------------------------
    # PARSE AZURE RESPONSE
    # -----------------------------------------------------

    try:

        response_data = (
            response.json()
        )

    except Exception as error:

        raise ValueError(
            "Azure Translator returned "
            "invalid JSON."
        ) from error


    if (
        not isinstance(
            response_data,
            list,
        )
        or
        len(response_data) == 0
    ):

        raise ValueError(
            "Azure Translator returned "
            "an empty response."
        )


    translations = (
        response_data[0]
        .get(
            "translations",
            []
        )
    )


    if not translations:

        raise ValueError(
            "Azure Translator returned "
            "no translation."
        )


    translated_text = (
        translations[0]
        .get(
            "text",
            ""
        )
    )


    translated_text = clean_text(
        translated_text
    )


    if not translated_text:

        raise ValueError(
            "Azure Translator returned "
            "empty translated text."
        )


    return translated_text


# =========================================================
# TRANSLATION CHUNKING
# =========================================================

def split_translation_chunks(
    text,
    max_length=TRANSLATION_CHUNK_SIZE,
):
    """
    Split long complaints into smaller
    translation-safe sections.
    """

    text = clean_text(
        text
    )


    if not text:

        return []


    if len(text) <= max_length:

        return [
            text
        ]


    sentences = re.split(
        r"(?<=[.!?।])\s+",
        text,
    )


    chunks = []

    current_chunk = ""


    for sentence in sentences:

        sentence = clean_text(
            sentence
        )


        if not sentence:

            continue


        candidate = clean_text(
            f"{current_chunk} "
            f"{sentence}"
        )


        if (
            len(candidate)
            <= max_length
        ):

            current_chunk = (
                candidate
            )

            continue


        if current_chunk:

            chunks.append(
                current_chunk
            )


        if (
            len(sentence)
            <= max_length
        ):

            current_chunk = (
                sentence
            )

        else:

            for index in range(
                0,
                len(sentence),
                max_length,
            ):

                piece = (
                    sentence[
                        index:
                        index
                        + max_length
                    ]
                )


                piece = clean_text(
                    piece
                )


                if piece:

                    chunks.append(
                        piece
                    )


            current_chunk = ""


    if current_chunk:

        chunks.append(
            current_chunk
        )


    return (
        chunks
        or
        [
            text
        ]
    )


# =========================================================
# TRANSLATE SINGLE CHUNK WITH RETRY
# =========================================================

def translate_chunk_with_retry(
    chunk,
    language,
):
    """
    Translate one chunk with retry handling.
    """

    errors = []


    for attempt_number in range(
        1,
        TRANSLATION_MAX_RETRIES + 1,
    ):

        try:

            translated = (
                attempt_translation(
                    chunk,
                    language,
                )
            )


            if is_valid_translation(
                translated,
                chunk,
                language,
            ):

                return translated


            errors.append(
                f"Attempt "
                f"{attempt_number}: "
                "invalid translated output"
            )


        except (
            requests.Timeout,
            requests.ConnectionError,
        ) as error:

            errors.append(
                f"Attempt "
                f"{attempt_number}: "
                f"network error - "
                f"{error}"
            )


        except Exception as error:

            errors.append(
                f"Attempt "
                f"{attempt_number}: "
                f"{error}"
            )


        if (
            attempt_number
            <
            TRANSLATION_MAX_RETRIES
        ):

            time.sleep(
                TRANSLATION_RETRY_DELAY
                * attempt_number
            )


    raise ValueError(
        "Azure translation failed. "
        + " | ".join(
            errors
        )
    )


# =========================================================
# TRANSLATE IN CHUNKS
# =========================================================

def translate_in_chunks(
    text,
    language,
):
    """
    Translate longer complaint text using
    multiple Azure Translator requests.
    """

    chunks = (
        split_translation_chunks(
            text
        )
    )


    if not chunks:

        raise ValueError(
            "No text available "
            "for translation"
        )


    translated_chunks = []


    for index, chunk in enumerate(
        chunks,
        start=1,
    ):

        try:

            translated_chunk = (
                translate_chunk_with_retry(
                    chunk,
                    language,
                )
            )


        except Exception as error:

            raise ValueError(
                f"Unable to translate "
                f"complaint section "
                f"{index}/"
                f"{len(chunks)}: "
                f"{error}"
            ) from error


        translated_chunks.append(
            translated_chunk
        )


        if (
            index
            <
            len(chunks)
        ):

            time.sleep(
                0.20
            )


    translated_text = clean_text(
        " ".join(
            translated_chunks
        )
    )


    if not is_valid_translation(
        translated_text,
        text,
        language,
    ):

        raise ValueError(
            "Combined Azure translation "
            "failed validation."
        )


    return translated_text


# =========================================================
# MAIN TRANSLATION FUNCTION
# =========================================================

def translate_to_english(
    text,
    language,
):
    """
    Translate Sinhala/Tamil complaint text
    to English using Azure AI Translator.
    """

    text = clean_text(
        text
    )


    if not text:

        raise ValueError(
            "Complaint text is empty"
        )


    # -----------------------------------------------------
    # ENGLISH - NO TRANSLATION REQUIRED
    # -----------------------------------------------------

    if language == "en":

        return text


    # -----------------------------------------------------
    # SUPPORTED LANGUAGES
    # -----------------------------------------------------

    if (
        language
        not in [
            "si",
            "ta",
        ]
    ):

        raise ValueError(
            "Unsupported complaint language"
        )


    # -----------------------------------------------------
    # NORMAL REQUEST
    # -----------------------------------------------------

    try:

        translated = (
            translate_chunk_with_retry(
                text,
                language,
            )
        )


        if is_valid_translation(
            translated,
            text,
            language,
        ):

            return translated


    except Exception as direct_error:

        print(
            "\nAzure direct translation "
            "attempt failed:"
        )

        print(
            f" - {direct_error}"
        )


    # -----------------------------------------------------
    # CHUNKED FALLBACK
    # -----------------------------------------------------

    try:

        translated = (
            translate_in_chunks(
                text,
                language,
            )
        )


        if is_valid_translation(
            translated,
            text,
            language,
        ):

            return translated


    except Exception as chunk_error:

        print(
            "\nAzure chunked translation "
            "attempt failed:"
        )

        print(
            f" - {chunk_error}"
        )


    # -----------------------------------------------------
    # COMPLETE FAILURE
    # -----------------------------------------------------

    raise ValueError(
        "Sinhala/Tamil complaint translation "
        "is temporarily unavailable. "
        "Please try again."
    )


# =========================================================
# CATEGORY PREDICTION
# =========================================================

def predict_category_from_english(
    english_text,
):
    """
    Predict complaint category.
    """

    english_text = clean_text(
        english_text
    )


    if len(
        english_text
    ) < 3:

        raise ValueError(
            "Complaint text is too short "
            "for category prediction"
        )


    predicted_category = (
        category_model.predict(
            [
                english_text
            ]
        )[0]
    )


    probabilities = (
        category_model.predict_proba(
            [
                english_text
            ]
        )[0]
    )


    category_confidence = float(
        probabilities.max()
    )


    return (
        str(
            predicted_category
        ),
        category_confidence,
    )


# =========================================================
# PRIORITY PREDICTION
# =========================================================

def predict_priority_from_english(
    english_text,
):
    """
    Predict complaint priority using
    final Priority V3 model.
    """

    english_text = clean_text(
        english_text
    )


    if len(
        english_text
    ) < 3:

        raise ValueError(
            "Complaint text is too short "
            "for priority prediction"
        )


    predicted_priority = (
        priority_model.predict(
            [
                english_text
            ]
        )[0]
    )


    probabilities = (
        priority_model.predict_proba(
            [
                english_text
            ]
        )[0]
    )


    priority_confidence = float(
        probabilities.max()
    )


    return (
        str(
            predicted_priority
        ),
        priority_confidence,
    )


# =========================================================
# FULL COMPLAINT PREDICTION
# =========================================================

def predict_complaint(
    complaint_text,
):
    """
    Complete AI complaint pipeline:

    1. Clean complaint
    2. Detect language
    3. Azure translate to English
    4. Predict category
    5. Predict priority
    6. Determine manual-review requirement
    """

    # -----------------------------------------------------
    # 1. CLEAN
    # -----------------------------------------------------

    complaint_text = clean_text(
        complaint_text
    )


    if len(
        complaint_text
    ) < 3:

        raise ValueError(
            "Complaint text is too short"
        )


    # -----------------------------------------------------
    # 2. LANGUAGE
    # -----------------------------------------------------

    detected_language = (
        detect_language(
            complaint_text
        )
    )


    if (
        detected_language
        ==
        "unknown"
    ):

        raise ValueError(
            "Unable to detect "
            "complaint language"
        )


    if (
        detected_language
        not in
        SUPPORTED_LANGUAGES
    ):

        raise ValueError(
            "Unsupported complaint language"
        )


    # -----------------------------------------------------
    # 3. TRANSLATE
    # -----------------------------------------------------

    english_text = (
        translate_to_english(
            complaint_text,
            detected_language,
        )
    )


    english_text = clean_text(
        english_text
    )


    if len(
        english_text
    ) < 3:

        raise ValueError(
            "Translated complaint "
            "text is too short"
        )


    # -----------------------------------------------------
    # 4. CATEGORY
    # -----------------------------------------------------

    (
        predicted_category,
        category_confidence,
    ) = (
        predict_category_from_english(
            english_text
        )
    )


    # -----------------------------------------------------
    # 5. PRIORITY
    # -----------------------------------------------------

    (
        predicted_priority,
        priority_confidence,
    ) = (
        predict_priority_from_english(
            english_text
        )
    )


    # -----------------------------------------------------
    # 6. MANUAL REVIEW
    # -----------------------------------------------------

    category_requires_review = (
        category_confidence
        <
        CATEGORY_REVIEW_THRESHOLD
    )


    priority_requires_review = (
        priority_confidence
        <
        PRIORITY_REVIEW_THRESHOLD
    )


    requires_manual_review = (
        category_requires_review
        or
        priority_requires_review
    )


    # -----------------------------------------------------
    # 7. FINAL RESULT
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
                4,
            ),

        "priority":
            predicted_priority,

        "priorityConfidence":
            round(
                priority_confidence,
                4,
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
    complaint_text,
):
    """
    Backward-compatible wrapper for
    existing FastAPI integration.
    """

    result = (
        predict_complaint(
            complaint_text
        )
    )


    return {

        "originalText":
            result[
                "originalText"
            ],

        "detectedLanguage":
            result[
                "detectedLanguage"
            ],

        "translatedText":
            result[
                "translatedText"
            ],

        "category":
            result[
                "category"
            ],

        # Existing API expects
        # category confidence as "confidence".

        "confidence":
            result[
                "categoryConfidence"
            ],

        "priority":
            result[
                "priority"
            ],

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
# LOCAL AZURE INTEGRATION TEST
# =========================================================

if __name__ == "__main__":

    print(
        "\n"
        + "=" * 70
    )

    print(
        "AZURE AI COMPLAINT "
        "PREDICTION TEST"
    )

    print(
        "=" * 70
    )


    print(
        "\nAzure Translator:"
    )

    print(
        f"Endpoint : "
        f"{AZURE_TRANSLATOR_ENDPOINT}"
    )

    print(
        f"Region   : "
        f"{AZURE_TRANSLATOR_REGION}"
    )

    print(
        "Key      : "
        "Configured"
    )


    test_complaints = [

        # Sinhala garbage
        (
            "අපේ ගමේ ඉස්කෝලේ ලග "
            "කුණු ගොඩ ගැහිලා, "
            "ඉක්මනට ක්‍රියාමාර්ගයක් ගන්න."
        ),

        # Sinhala water supply
        (
            "අපේ ගෙවල් වලට "
            "ඊයේ ඉඳන් වතුර "
            "එන්නේ නැහැ."
        ),

        # Tamil drainage
        (
            "எங்கள் வீட்டுக்கு அருகில் உள்ள "
            "வடிகால் அடைத்துள்ளது."
        ),

        # English roads
        (
            "There is a large pothole "
            "near our school."
        ),

        # English garbage
        (
            "Garbage has not been collected "
            "from our street for a week."
        ),

        # Sinhala high-priority electricity
        (
            "අපේ පාරේ විදුලි කම්බියක් "
            "බිමට වැටිලා තියෙනවා."
        ),

        # Tamil environment
        (
            "அருகிலுள்ள தொழிற்சாலையிலிருந்து "
            "அதிக புகை வருகிறது."
        ),

        # English electricity high
        (
            "A live electrical wire is hanging "
            "beside the school entrance."
        ),

        # English drainage medium
        (
            "The roadside drain is blocked "
            "and rainwater is flooding "
            "the street."
        ),

        # English environment
        (
            "A strong chemical smell is "
            "spreading through the "
            "neighbourhood."
        ),

        # English low priority
        (
            "One street lamp is dim "
            "but still provides some light."
        ),

        # English high priority
        (
            "Floodwater is rising rapidly "
            "around several houses and "
            "residents cannot leave safely."
        ),
    ]


    for complaint in test_complaints:

        try:

            result = (
                predict_complaint(
                    complaint
                )
            )


            print(
                "\n"
                + "=" * 70
            )


            print(
                "Original:"
            )

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
                "\n"
                + "=" * 70
            )

            print(
                "Prediction Error:"
            )

            print(
                error
            )