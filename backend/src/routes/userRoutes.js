const express = require("express");

const {
  createOfficer,
} = require("../controllers/userController");

const {
  createOfficerValidation,
  validateRequest,
} = require("../middleware/validationMiddleware");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/officers",
  protect,
  authorize("admin"),
  createOfficerValidation,
  validateRequest,
  createOfficer
);

module.exports = router;