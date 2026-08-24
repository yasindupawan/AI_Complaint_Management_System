const {
  classifyComplaint,
} = require("./services/aiService");

// =========================================================
// TEST COMPLAINTS
// =========================================================

const testComplaints = [
  {
    name: "English - High Priority Electricity",
    text:
      "A live electrical wire is hanging beside the school entrance.",
  },

  {
    name: "Sinhala - Water Supply",
    text:
      "අපේ ගෙවල් වලට ඊයේ ඉඳන් වතුර එන්නේ නැහැ.",
  },

  {
    name: "Tamil - Drainage",
    text:
      "எங்கள் வீட்டுக்கு அருகில் உள்ள வடிகால் அடைத்துள்ளது.",
  },
];

// =========================================================
// RUN AI SERVICE TEST
// =========================================================

const runTests = async () => {
  console.log(
    "\n============================================================"
  );
  console.log(
    "NODE.JS -> FASTAPI AI SERVICE INTEGRATION TEST"
  );
  console.log(
    "============================================================"
  );

  let passed = 0;
  let failed = 0;

  for (const test of testComplaints) {
    try {
      console.log(
        "\n------------------------------------------------------------"
      );

      console.log(`TEST: ${test.name}`);

      console.log("\nComplaint:");
      console.log(test.text);

      console.log("\nSending complaint to AI service...");

      const result = await classifyComplaint(
        test.text
      );

      console.log("\nAI RESULT:");

      console.log({
        category:
          result.category,

        categoryConfidence:
          result.categoryConfidence,

        priority:
          result.priority,

        priorityConfidence:
          result.priorityConfidence,

        detectedLanguage:
          result.detectedLanguage,

        translatedText:
          result.translatedText,

        requiresManualReview:
          result.requiresManualReview,
      });

      // ===================================================
      // VALIDATE RESULT
      // ===================================================

      const validCategories = [
        "roads",
        "garbage",
        "water_supply",
        "electricity",
        "drainage",
        "environment",
      ];

      const validPriorities = [
        "low",
        "medium",
        "high",
      ];

      if (
        !validCategories.includes(
          result.category
        )
      ) {
        throw new Error(
          `Invalid category: ${result.category}`
        );
      }

      if (
        !validPriorities.includes(
          result.priority
        )
      ) {
        throw new Error(
          `Invalid priority: ${result.priority}`
        );
      }

      if (
        typeof result.categoryConfidence !==
          "number" ||
        result.categoryConfidence < 0 ||
        result.categoryConfidence > 1
      ) {
        throw new Error(
          "Invalid category confidence"
        );
      }

      if (
        typeof result.priorityConfidence !==
          "number" ||
        result.priorityConfidence < 0 ||
        result.priorityConfidence > 1
      ) {
        throw new Error(
          "Invalid priority confidence"
        );
      }

      if (
        typeof result.requiresManualReview !==
        "boolean"
      ) {
        throw new Error(
          "Invalid manual review value"
        );
      }

      console.log("\nTEST PASSED");
      passed++;
    } catch (error) {
      console.error("\nTEST FAILED:");
      console.error(error.message);

      failed++;
    }
  }

  // =======================================================
  // SUMMARY
  // =======================================================

  console.log(
    "\n============================================================"
  );

  console.log("TEST SUMMARY");

  console.log(
    "============================================================"
  );

  console.log(`Total Tests : ${testComplaints.length}`);
  console.log(`Passed      : ${passed}`);
  console.log(`Failed      : ${failed}`);

  if (failed === 0) {
    console.log(
      "\nALL AI SERVICE INTEGRATION TESTS PASSED"
    );
  } else {
    console.log(
      "\nSOME AI SERVICE INTEGRATION TESTS FAILED"
    );
  }
};

// =========================================================
// START TEST
// =========================================================

runTests();