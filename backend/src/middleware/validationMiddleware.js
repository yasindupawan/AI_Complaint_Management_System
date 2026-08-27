const {
  body,
  validationResult,
} = require("express-validator");

/* =========================================================
   HELPER - VALIDATE SRI LANKAN NIC
========================================================= */

const isValidSriLankanNic = (value) => {
  const nic = String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();

  // Old NIC example:
  // 123456789V
  // 123456789X
  const oldNicPattern =
    /^\d{9}[VX]$/;

  // New NIC example:
  // 200012345678
  const newNicPattern =
    /^\d{12}$/;

  return (
    oldNicPattern.test(nic) ||
    newNicPattern.test(nic)
  );
};

/* =========================================================
   RETURN VALIDATION ERRORS
========================================================= */

const validateRequest = (
  req,
  res,
  next
) => {
  const errors =
    validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message:
        "Validation failed",
      errors:
        errors.array(),
    });
  }

  next();
};

/* =========================================================
   SEND REGISTRATION OTP VALIDATION
========================================================= */

const sendRegistrationOtpValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage(
      "Email is required"
    )
    .isEmail()
    .withMessage(
      "Please provide a valid email address"
    )
    .normalizeEmail(),
];

/* =========================================================
   VERIFY REGISTRATION OTP VALIDATION
========================================================= */

const verifyRegistrationOtpValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage(
      "Email is required"
    )
    .isEmail()
    .withMessage(
      "Please provide a valid email address"
    )
    .normalizeEmail(),

  body("otp")
    .trim()
    .notEmpty()
    .withMessage(
      "OTP is required"
    )
    .matches(/^\d{6}$/)
    .withMessage(
      "OTP must be exactly 6 digits"
    ),
];

/* =========================================================
   CITIZEN REGISTRATION VALIDATION
========================================================= */

const registerValidation = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage(
      "Full name is required"
    )
    .isLength({
      min: 2,
      max: 100,
    })
    .withMessage(
      "Full name must be between 2 and 100 characters"
    ),

  body("nic")
    .trim()
    .notEmpty()
    .withMessage(
      "NIC number is required"
    )
    .customSanitizer(
      (value) =>
        String(value || "")
          .replace(
            /\s+/g,
            ""
          )
          .toUpperCase()
    )
    .custom(
      (value) => {
        if (
          !isValidSriLankanNic(
            value
          )
        ) {
          throw new Error(
            "Please provide a valid Sri Lankan NIC number"
          );
        }

        return true;
      }
    ),

  body("email")
    .trim()
    .notEmpty()
    .withMessage(
      "Email is required"
    )
    .isEmail()
    .withMessage(
      "Please provide a valid email address"
    )
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage(
      "Password is required"
    )
    .isLength({
      min: 8,
    })
    .withMessage(
      "Password must be at least 8 characters long"
    ),

  body("preferredLanguage")
    .optional()
    .isIn([
      "english",
      "sinhala",
      "tamil",
    ])
    .withMessage(
      "Preferred language must be english, sinhala, or tamil"
    ),
];

/* =========================================================
   LOGIN VALIDATION
========================================================= */

const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage(
      "Email is required"
    )
    .isEmail()
    .withMessage(
      "Please provide a valid email address"
    )
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage(
      "Password is required"
    ),
];

/* =========================================================
   COMPLAINT CREATION VALIDATION
========================================================= */

const createComplaintValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage(
      "Complaint title is required"
    )
    .isLength({
      min: 5,
      max: 150,
    })
    .withMessage(
      "Complaint title must be between 5 and 150 characters"
    ),

  body("description")
    .trim()
    .notEmpty()
    .withMessage(
      "Complaint description is required"
    )
    .isLength({
      min: 15,
      max: 2000,
    })
    .withMessage(
      "Complaint description must be between 15 and 2000 characters"
    ),

  body("submittedLanguage")
    .notEmpty()
    .withMessage(
      "Submitted language is required"
    )
    .isIn([
      "english",
      "sinhala",
      "tamil",
    ])
    .withMessage(
      "Submitted language must be english, sinhala, or tamil"
    ),

  body("location.address")
    .optional()
    .trim()
    .isLength({
      max: 300,
    })
    .withMessage(
      "Location address cannot exceed 300 characters"
    ),

  body("location.latitude")
    .optional()
    .isFloat({
      min: -90,
      max: 90,
    })
    .withMessage(
      "Latitude must be between -90 and 90"
    ),

  body("location.longitude")
    .optional()
    .isFloat({
      min: -180,
      max: 180,
    })
    .withMessage(
      "Longitude must be between -180 and 180"
    ),
];

/* =========================================================
   UPDATE COMPLAINT STATUS VALIDATION
========================================================= */

const updateComplaintStatusValidation = [
  body("status")
    .notEmpty()
    .withMessage(
      "Status is required"
    )
    .isIn([
      "submitted",
      "under_review",
      "assigned",
      "in_progress",
      "resolved",
      "rejected",
      "duplicate",
    ])
    .withMessage(
      "Invalid complaint status"
    ),

  body("remarks")
    .optional()
    .trim()
    .isLength({
      max: 1000,
    })
    .withMessage(
      "Remarks cannot exceed 1000 characters"
    ),
];

/* =========================================================
   CREATE DEPARTMENT VALIDATION
========================================================= */

const createDepartmentValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage(
      "Department name is required"
    )
    .isLength({
      min: 3,
      max: 150,
    })
    .withMessage(
      "Department name must be between 3 and 150 characters"
    ),

  body("code")
    .trim()
    .notEmpty()
    .withMessage(
      "Department code is required"
    )
    .isLength({
      min: 2,
      max: 20,
    })
    .withMessage(
      "Department code must be between 2 and 20 characters"
    ),

  body("description")
    .optional()
    .trim()
    .isLength({
      max: 500,
    })
    .withMessage(
      "Department description cannot exceed 500 characters"
    ),

  body("categories")
    .optional()
    .isArray()
    .withMessage(
      "Categories must be an array"
    ),

  body("categories.*")
    .optional()
    .isIn([
      "roads",
      "garbage",
      "water_supply",
      "electricity",
      "drainage",
      "environment",
    ])
    .withMessage(
      "Invalid department category"
    ),
];

/* =========================================================
   CREATE OFFICER VALIDATION

   NIC / Citizen OTP verification is intentionally NOT
   required here because officers are created by Admin.
========================================================= */

const createOfficerValidation = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage(
      "Full name is required"
    )
    .isLength({
      min: 2,
      max: 100,
    })
    .withMessage(
      "Full name must be between 2 and 100 characters"
    ),

  body("email")
    .trim()
    .notEmpty()
    .withMessage(
      "Email is required"
    )
    .isEmail()
    .withMessage(
      "Please provide a valid email address"
    )
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage(
      "Password is required"
    )
    .isLength({
      min: 8,
    })
    .withMessage(
      "Password must be at least 8 characters long"
    ),

  body("department")
    .notEmpty()
    .withMessage(
      "Department is required"
    )
    .isMongoId()
    .withMessage(
      "Department must be a valid MongoDB ID"
    ),

  body("preferredLanguage")
    .optional()
    .isIn([
      "english",
      "sinhala",
      "tamil",
    ])
    .withMessage(
      "Preferred language must be english, sinhala, or tamil"
    ),
];

/* =========================================================
   ASSIGN COMPLAINT VALIDATION
========================================================= */

const assignComplaintValidation = [
  body("department")
    .notEmpty()
    .withMessage(
      "Department is required"
    )
    .isMongoId()
    .withMessage(
      "Department must be a valid MongoDB ID"
    ),

  body("officer")
    .notEmpty()
    .withMessage(
      "Officer is required"
    )
    .isMongoId()
    .withMessage(
      "Officer must be a valid MongoDB ID"
    ),

  body("remarks")
    .optional()
    .trim()
    .isLength({
      max: 1000,
    })
    .withMessage(
      "Remarks cannot exceed 1000 characters"
    ),
];

/* =========================================================
   OFFICER UPDATE STATUS VALIDATION
========================================================= */

const officerUpdateStatusValidation = [
  body("status")
    .notEmpty()
    .withMessage(
      "Status is required"
    )
    .isIn([
      "in_progress",
      "resolved",
    ])
    .withMessage(
      "Officer status must be either in_progress or resolved"
    ),

  body("remarks")
    .optional()
    .trim()
    .isLength({
      max: 1000,
    })
    .withMessage(
      "Remarks cannot exceed 1000 characters"
    ),
];

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  sendRegistrationOtpValidation,
  verifyRegistrationOtpValidation,

  registerValidation,
  loginValidation,

  createComplaintValidation,
  updateComplaintStatusValidation,

  createDepartmentValidation,
  createOfficerValidation,

  assignComplaintValidation,
  officerUpdateStatusValidation,

  validateRequest,
};