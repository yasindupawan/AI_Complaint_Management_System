import re

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


# =========================================================
# CONFIGURATION
# =========================================================

MODEL_NAME = "all-MiniLM-L6-v2"

# Initial threshold.
# We will validate/tune this later using duplicate test data.
DUPLICATE_THRESHOLD = 0.75


# =========================================================
# LOAD SENTENCE TRANSFORMER MODEL
# =========================================================

print("Loading semantic duplicate detection model...")

semantic_model = SentenceTransformer(
    MODEL_NAME
)

print("Semantic duplicate detection model loaded.")


# =========================================================
# TEXT CLEANING
# =========================================================

def clean_duplicate_text(text):
    """
    Normalize English complaint text before semantic
    similarity comparison.
    """

    if text is None:
        return ""

    text = str(text).lower().strip()

    # Replace repeated whitespace
    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text.strip()


# =========================================================
# CALCULATE SEMANTIC SIMILARITY
# =========================================================

def calculate_similarity(
    new_complaint,
    existing_complaint
):
    """
    Calculate semantic cosine similarity between
    two complaint texts.

    Returns a score between 0 and 1.
    """

    new_text = clean_duplicate_text(
        new_complaint
    )

    existing_text = clean_duplicate_text(
        existing_complaint
    )

    if not new_text or not existing_text:
        return 0.0

    # Exact normalized duplicate
    if new_text == existing_text:
        return 1.0

    # -----------------------------------------------------
    # Generate sentence embeddings
    # -----------------------------------------------------

    embeddings = semantic_model.encode(
        [
            new_text,
            existing_text
        ],
        convert_to_numpy=True,
        normalize_embeddings=True
    )

    # -----------------------------------------------------
    # Cosine similarity
    # -----------------------------------------------------

    similarity = cosine_similarity(
        embeddings[0].reshape(1, -1),
        embeddings[1].reshape(1, -1)
    )[0][0]

    # Numerical safety
    similarity = max(
        0.0,
        min(
            1.0,
            float(similarity)
        )
    )

    return round(
        similarity,
        4
    )


# =========================================================
# FIND BEST DUPLICATE
# =========================================================

def find_best_duplicate(
    new_complaint,
    existing_complaints,
    threshold=DUPLICATE_THRESHOLD
):
    """
    Compare a new complaint against existing complaints
    and return the strongest semantic match.

    Expected existing complaint format:

    {
        "id": "complaint id",
        "text": "English complaint text"
    }
    """

    if not existing_complaints:
        return {
            "isPotentialDuplicate": False,
            "matchedComplaintId": None,
            "similarityScore": 0.0,
            "threshold": threshold,
        }

    new_text = clean_duplicate_text(
        new_complaint
    )

    if not new_text:
        return {
            "isPotentialDuplicate": False,
            "matchedComplaintId": None,
            "similarityScore": 0.0,
            "threshold": threshold,
        }

    # -----------------------------------------------------
    # Prepare valid existing complaints
    # -----------------------------------------------------

    valid_complaints = []

    for complaint in existing_complaints:

        complaint_text = clean_duplicate_text(
            complaint.get(
                "text",
                ""
            )
        )

        if complaint_text:
            valid_complaints.append(
                {
                    "id": complaint.get("id"),
                    "text": complaint_text,
                }
            )

    if not valid_complaints:
        return {
            "isPotentialDuplicate": False,
            "matchedComplaintId": None,
            "similarityScore": 0.0,
            "threshold": threshold,
        }

    # -----------------------------------------------------
    # Generate embedding for new complaint
    # -----------------------------------------------------

    new_embedding = semantic_model.encode(
        [new_text],
        convert_to_numpy=True,
        normalize_embeddings=True
    )

    # -----------------------------------------------------
    # Generate embeddings for existing complaints
    # -----------------------------------------------------

    existing_texts = [
        complaint["text"]
        for complaint in valid_complaints
    ]

    existing_embeddings = semantic_model.encode(
        existing_texts,
        convert_to_numpy=True,
        normalize_embeddings=True
    )

    # -----------------------------------------------------
    # Compare new complaint against all existing complaints
    # -----------------------------------------------------

    similarities = cosine_similarity(
        new_embedding,
        existing_embeddings
    )[0]

    best_index = int(
        similarities.argmax()
    )

    best_score = float(
        similarities[best_index]
    )

    best_score = max(
        0.0,
        min(
            1.0,
            best_score
        )
    )

    best_match = valid_complaints[
        best_index
    ]

    is_potential_duplicate = (
        best_score >= threshold
    )

    # -----------------------------------------------------
    # Return result
    # -----------------------------------------------------

    return {
        "isPotentialDuplicate":
            bool(is_potential_duplicate),

        "matchedComplaintId":
            best_match["id"]
            if is_potential_duplicate
            else None,

        "similarityScore":
            round(
                best_score,
                4
            ),

        "threshold":
            threshold,
    }


# =========================================================
# LOCAL TEST
# =========================================================

if __name__ == "__main__":

    existing_complaints = [
        {
            "id": "complaint_001",
            "text":
                "There is a large pothole on the main road near the school."
        },

        {
            "id": "complaint_002",
            "text":
                "Garbage has not been collected from our street for several days."
        },

        {
            "id": "complaint_003",
            "text":
                "There is no water supply to our houses since yesterday."
        }
    ]

    test_complaints = [
        {
            "name":
                "Reworded road duplicate",

            "text":
                "A large pothole is on the main road near the school."
        },

        {
            "name":
                "Reworded water duplicate",

            "text":
                "Our houses have had no water supply since yesterday."
        },

        {
            "name":
                "Different electricity complaint",

            "text":
                "A live electrical wire has fallen beside the market."
        }
    ]

    print(
        "\n"
        + "=" * 70
    )

    print(
        "SEMANTIC DUPLICATE DETECTION TEST"
    )

    print(
        "=" * 70
    )

    for test in test_complaints:

        result = find_best_duplicate(
            test["text"],
            existing_complaints
        )

        print(
            "\n"
            + "=" * 70
        )

        print(
            f"TEST: {test['name']}"
        )

        print("\nNEW COMPLAINT:")
        print(
            test["text"]
        )

        print(
            "\nDUPLICATE RESULT:"
        )

        print(
            result
        )