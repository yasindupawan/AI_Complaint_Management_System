const express = require("express");

const {
  createDepartment,
  getDepartments,
  getOfficersByDepartment,
  updateDepartment,
  updateDepartmentStatus,
  deleteDepartment,
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
// ALL DEPARTMENT ROUTES ARE ADMIN ONLY
// ======================================================

// ------------------------------------------------------
// Create department
// POST /api/departments
// ------------------------------------------------------

router.post(
  "/",
  protect,
  authorize("admin"),
  createDepartmentValidation,
  validateRequest,
  createDepartment
);

// ------------------------------------------------------
// Get all departments
// GET /api/departments
// ------------------------------------------------------

router.get(
  "/",
  protect,
  authorize("admin"),
  getDepartments
);

// ------------------------------------------------------
// Get active officers by department
// GET /api/departments/:departmentId/officers
//
// IMPORTANT:
// Keep before routes using /:id if needed for clarity.
// ------------------------------------------------------

router.get(
  "/:departmentId/officers",
  protect,
  authorize("admin"),
  getOfficersByDepartment
);

// ------------------------------------------------------
// Update department
// PATCH /api/departments/:id
// ------------------------------------------------------

router.patch(
  "/:id",
  protect,
  authorize("admin"),
  updateDepartment
);

// ------------------------------------------------------
// Activate / deactivate department
// PATCH /api/departments/:id/status
// ------------------------------------------------------

router.patch(
  "/:id/status",
  protect,
  authorize("admin"),
  updateDepartmentStatus
);

// ------------------------------------------------------
// Delete department
// DELETE /api/departments/:id
// ------------------------------------------------------

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteDepartment
);

// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;