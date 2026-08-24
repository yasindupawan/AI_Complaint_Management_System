const express = require("express");

const {
  createDepartment,
  getDepartments,
  getOfficersByDepartment,
} = require(
  "../controllers/departmentController"
);

const {
  createDepartmentValidation,
  validateRequest,
} = require(
  "../middleware/validationMiddleware"
);

const {
  protect,
  authorize,
} = require(
  "../middleware/authMiddleware"
);

const router = express.Router();

// ======================================================
// ADMIN - CREATE DEPARTMENT
// ======================================================

router.post(
  "/",
  protect,
  authorize("admin"),
  createDepartmentValidation,
  validateRequest,
  createDepartment
);

// ======================================================
// ADMIN - GET DEPARTMENTS
// ======================================================

router.get(
  "/",
  protect,
  authorize("admin"),
  getDepartments
);

// ======================================================
// ADMIN - GET OFFICERS BY DEPARTMENT
// ======================================================

router.get(
  "/:departmentId/officers",
  protect,
  authorize("admin"),
  getOfficersByDepartment
);

// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;