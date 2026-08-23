const express = require("express");

const {
  createDepartment,
  getDepartments,
} = require("../controllers/departmentController");

const {
  createDepartmentValidation,
  validateRequest,
} = require("../middleware/validationMiddleware");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("admin"),
  createDepartmentValidation,
  validateRequest,
  createDepartment
);

router.get(
  "/",
  protect,
  authorize("admin"),
  getDepartments
);

module.exports = router;