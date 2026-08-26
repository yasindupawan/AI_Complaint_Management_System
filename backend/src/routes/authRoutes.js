const express = require("express");

const {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const {
  registerValidation,
  loginValidation,
  validateRequest,
} = require("../middleware/validationMiddleware");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================================================
   REGISTER
========================================================= */

router.post(
  "/register",
  registerValidation,
  validateRequest,
  registerUser
);

/* =========================================================
   LOGIN
========================================================= */

router.post(
  "/login",
  loginValidation,
  validateRequest,
  loginUser
);

/* =========================================================
   FORGOT PASSWORD
========================================================= */

router.post(
  "/forgot-password",
  forgotPassword
);

/* =========================================================
   RESET PASSWORD
========================================================= */

router.post(
  "/reset-password/:token",
  resetPassword
);

/* =========================================================
   CURRENT USER
========================================================= */

router.get(
  "/me",
  protect,
  getMe
);

module.exports = router;