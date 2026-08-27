const express = require("express");

const {
  sendRegistrationOtp,
  verifyRegistrationOtp,
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const {
  sendRegistrationOtpValidation,
  verifyRegistrationOtpValidation,
  registerValidation,
  loginValidation,
  validateRequest,
} = require("../middleware/validationMiddleware");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================================================
   SEND REGISTRATION OTP
========================================================= */

// @desc    Send 6-digit OTP to citizen email
// @route   POST /api/auth/send-registration-otp
// @access  Public
router.post(
  "/send-registration-otp",
  sendRegistrationOtpValidation,
  validateRequest,
  sendRegistrationOtp
);

/* =========================================================
   VERIFY REGISTRATION OTP
========================================================= */

// @desc    Verify citizen registration OTP
// @route   POST /api/auth/verify-registration-otp
// @access  Public
router.post(
  "/verify-registration-otp",
  verifyRegistrationOtpValidation,
  validateRequest,
  verifyRegistrationOtp
);

/* =========================================================
   REGISTER CITIZEN
========================================================= */

// @desc    Create citizen account after email verification
// @route   POST /api/auth/register
// @access  Public
router.post(
  "/register",
  registerValidation,
  validateRequest,
  registerUser
);

/* =========================================================
   LOGIN
========================================================= */

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post(
  "/login",
  loginValidation,
  validateRequest,
  loginUser
);

/* =========================================================
   FORGOT PASSWORD
========================================================= */

// @desc    Generate password reset token
// @route   POST /api/auth/forgot-password
// @access  Public
router.post(
  "/forgot-password",
  forgotPassword
);

/* =========================================================
   RESET PASSWORD
========================================================= */

// @desc    Reset password using reset token
// @route   POST /api/auth/reset-password/:token
// @access  Public
router.post(
  "/reset-password/:token",
  resetPassword
);

/* =========================================================
   CURRENT AUTHENTICATED USER
========================================================= */

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
router.get(
  "/me",
  protect,
  getMe
);

/* =========================================================
   EXPORT ROUTER
========================================================= */

module.exports = router;