const express = require("express");

const {
  createOfficer,
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateOfficerDepartment,
  getUserStatistics,
  deleteUser,
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

// =========================================================
// ALL ROUTES BELOW ARE ADMIN ONLY
// =========================================================

// ---------------------------------------------------------
// Create officer
// POST /api/users/officers
// ---------------------------------------------------------

router.post(
  "/officers",
  protect,
  authorize("admin"),
  createOfficerValidation,
  validateRequest,
  createOfficer
);

// ---------------------------------------------------------
// User statistics
// GET /api/users/admin/statistics
//
// IMPORTANT:
// Keep this BEFORE /:id
// ---------------------------------------------------------

router.get(
  "/admin/statistics",
  protect,
  authorize("admin"),
  getUserStatistics
);

// ---------------------------------------------------------
// Get all users
// GET /api/users
//
// Optional query examples:
//
// /api/users?role=citizen
// /api/users?role=officer
// /api/users?status=active
// /api/users?status=inactive
// /api/users?department=DEPARTMENT_ID
// /api/users?search=test
//
// Filters can also be combined.
// ---------------------------------------------------------

router.get(
  "/",
  protect,
  authorize("admin"),
  getAllUsers
);

// ---------------------------------------------------------
// Update user active status
// PATCH /api/users/:id/status
//
// Body example:
// {
//   "isActive": false
// }
// ---------------------------------------------------------

router.patch(
  "/:id/status",
  protect,
  authorize("admin"),
  updateUserStatus
);

// ---------------------------------------------------------
// Update officer department
// PATCH /api/users/:id/department
//
// Body example:
// {
//   "department": "DEPARTMENT_ID"
// }
// ---------------------------------------------------------

router.patch(
  "/:id/department",
  protect,
  authorize("admin"),
  updateOfficerDepartment
);

// ---------------------------------------------------------
// Delete citizen / officer account
// DELETE /api/users/:id
//
// IMPORTANT:
// Controller will prevent unsafe deletion when:
// - User is an admin
// - Citizen has complaint records
// - Officer is linked to complaints
// - Officer has status history records
//
// In those cases the account should be deactivated instead.
// ---------------------------------------------------------

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteUser
);

// ---------------------------------------------------------
// Get single user
// GET /api/users/:id
//
// Keep near the bottom because :id is dynamic.
// ---------------------------------------------------------

router.get(
  "/:id",
  protect,
  authorize("admin"),
  getUserById
);

// =========================================================
// EXPORT ROUTER
// =========================================================

module.exports = router;