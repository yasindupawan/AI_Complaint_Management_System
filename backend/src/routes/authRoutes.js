const express = require("express");

const {
  registerUser,
  loginUser,
  getMe,
} = require("../controllers/authController");

const {
  registerValidation,
  loginValidation,
  validateRequest,
} = require("../middleware/validationMiddleware");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/register",
  registerValidation,
  validateRequest,
  registerUser
);

router.post(
  "/login",
  loginValidation,
  validateRequest,
  loginUser
);

router.get("/me", protect, getMe);



module.exports = router;