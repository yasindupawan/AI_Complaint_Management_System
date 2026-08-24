const axios = require("axios");

// =========================================================
// AI SERVICE CONFIGURATION
// =========================================================

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

// =========================================================
// CLASSIFY COMPLAINT
// =========================================================

/**
 * Send complaint text to FastAPI.
 *
 * AI service performs:
 * 1. Language detection
 * 2. Sinhala / Tamil -> English translation
 * 3. Category classification
 * 4. Priority classification
 * 5. Confidence-based manual review decision
 */
const classifyComplaint = async (complaintText) => {
  try {
    if (
      typeof complaintText !== "string" ||
      complaintText.trim().length < 3
    ) {
      throw new Error("Invalid complaint text");
    }

    const response = await axios.post(
      `${AI_SERVICE_URL}/predict-category`,
      {
        complaint_text: complaintText.trim(),
      },
      {
        timeout: 15000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const prediction = response.data?.prediction;

    if (!prediction) {
      throw new Error(
        "Invalid response received from AI service"
      );
    }

    if (
      !prediction.category ||
      typeof prediction.categoryConfidence !== "number" ||
      !prediction.priority ||
      typeof prediction.priorityConfidence !== "number"
    ) {
      throw new Error(
        "AI service returned incomplete prediction data"
      );
    }

    return {
      category:
        prediction.category,

      categoryConfidence:
        prediction.categoryConfidence,

      priority:
        prediction.priority,

      priorityConfidence:
        prediction.priorityConfidence,

      detectedLanguage:
        prediction.detectedLanguage,

      translatedText:
        prediction.translatedText,

      requiresManualReview:
        Boolean(
          prediction.requiresManualReview
        ),
    };
  } catch (error) {
    if (error.response) {
      console.error(
        "AI classification response error:",
        error.response.status,
        error.response.data
      );
    } else {
      console.error(
        "AI classification connection error:",
        error.message
      );
    }

    throw new Error(
      "Complaint classification failed"
    );
  }
};

// =========================================================
// DETECT DUPLICATE
// =========================================================

/**
 * Compare a new complaint against existing complaints
 * using the FastAPI semantic duplicate detection service.
 *
 * existingComplaints format:
 *
 * [
 *   {
 *     id: "...",
 *     text: "..."
 *   }
 * ]
 */
const detectDuplicate = async (
  complaintText,
  existingComplaints,
  threshold = 0.75
) => {
  try {
    // -----------------------------------------------------
    // Validate complaint text
    // -----------------------------------------------------

    if (
      typeof complaintText !== "string" ||
      complaintText.trim().length < 3
    ) {
      throw new Error(
        "Invalid complaint text for duplicate detection"
      );
    }

    // -----------------------------------------------------
    // Validate existing complaints
    // -----------------------------------------------------

    const complaints = Array.isArray(
      existingComplaints
    )
      ? existingComplaints
      : [];

    // No previous complaints means duplicate is impossible
    if (complaints.length === 0) {
      return {
        isPotentialDuplicate: false,
        matchedComplaintId: null,
        similarityScore: 0,
        threshold,
      };
    }

    // -----------------------------------------------------
    // Normalize data sent to FastAPI
    // -----------------------------------------------------

    const normalizedComplaints =
      complaints
        .filter(
          (complaint) =>
            complaint &&
            complaint.id &&
            typeof complaint.text === "string" &&
            complaint.text.trim().length >= 3
        )
        .map((complaint) => ({
          id: String(complaint.id),

          text:
            complaint.text.trim(),
        }));

    if (
      normalizedComplaints.length === 0
    ) {
      return {
        isPotentialDuplicate: false,
        matchedComplaintId: null,
        similarityScore: 0,
        threshold,
      };
    }

    // -----------------------------------------------------
    // Send request to FastAPI
    // -----------------------------------------------------

    const response = await axios.post(
      `${AI_SERVICE_URL}/detect-duplicate`,
      {
        complaint_text:
          complaintText.trim(),

        existing_complaints:
          normalizedComplaints,

        threshold,
      },
      {
        timeout: 30000,

        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // -----------------------------------------------------
    // Extract duplicate result
    // -----------------------------------------------------

    const duplicate =
      response.data?.duplicate;

    if (!duplicate) {
      throw new Error(
        "Invalid duplicate detection response"
      );
    }

    // -----------------------------------------------------
    // Validate result
    // -----------------------------------------------------

    if (
      typeof duplicate.isPotentialDuplicate !==
        "boolean" ||
      typeof duplicate.similarityScore !==
        "number"
    ) {
      throw new Error(
        "AI service returned incomplete duplicate data"
      );
    }

    // -----------------------------------------------------
    // Return normalized duplicate result
    // -----------------------------------------------------

    return {
      isPotentialDuplicate:
        duplicate.isPotentialDuplicate,

      matchedComplaintId:
        duplicate.matchedComplaintId || null,

      similarityScore:
        duplicate.similarityScore,

      threshold:
        duplicate.threshold,
    };
  } catch (error) {
    if (error.response) {
      console.error(
        "Duplicate detection response error:",
        error.response.status,
        error.response.data
      );
    } else {
      console.error(
        "Duplicate detection connection error:",
        error.message
      );
    }

    throw new Error(
      "Complaint duplicate detection failed"
    );
  }
};

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  classifyComplaint,
  detectDuplicate,
};