const express = require("express");

const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getComplaintHistory,

  // Admin
  getAllComplaints,
  getAdminComplaintById,
  getAdminComplaintHistory,
  updateComplaintStatus,
  assignComplaint,
  confirmDuplicate,
  rejectDuplicateFlag,

  // Officer
  getAssignedComplaints,
  updateAssignedComplaintStatus,
} = require("../controllers/complaintController");

const {
  createComplaintValidation,
  updateComplaintStatusValidation,
  assignComplaintValidation,
  officerUpdateStatusValidation,
  validateRequest,
} = require("../middleware/validationMiddleware");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// ======================================================
// IMAGE UPLOAD MIDDLEWARE
// ======================================================

const {
  uploadComplaintImages,
} = require("../middleware/uploadMiddleware");

const router = express.Router();

// ======================================================
// CITIZEN ROUTES
// ======================================================

// ------------------------------------------------------
// Submit a new complaint
// POST /api/complaints
// Private - Citizen
// Supports maximum 5 complaint images
// ------------------------------------------------------

router.post(
  "/",
  protect,
  authorize("citizen"),

  // Process multipart/form-data images
  uploadComplaintImages,

  // Validate complaint fields
  createComplaintValidation,
  validateRequest,

  // Create complaint
  createComplaint
);

// ------------------------------------------------------
// Get complaints submitted by logged-in citizen
// GET /api/complaints/my
// Private - Citizen
// ------------------------------------------------------

router.get(
  "/my",
  protect,
  authorize("citizen"),
  getMyComplaints
);

// ======================================================
// ADMIN ROUTES
// ======================================================

// ------------------------------------------------------
// Get all complaints
// GET /api/complaints/admin/all
// Private - Admin
// ------------------------------------------------------

router.get(
  "/admin/all",
  protect,
  authorize("admin"),
  getAllComplaints
);

// ------------------------------------------------------
// Get single complaint for admin
// GET /api/complaints/admin/:id
// Private - Admin
// ------------------------------------------------------

router.get(
  "/admin/:id",
  protect,
  authorize("admin"),
  getAdminComplaintById
);

// ------------------------------------------------------
// Get complaint status history for admin
// GET /api/complaints/admin/:id/history
// Private - Admin
// ------------------------------------------------------

router.get(
  "/admin/:id/history",
  protect,
  authorize("admin"),
  getAdminComplaintHistory
);

// ------------------------------------------------------
// Update complaint status
// PATCH /api/complaints/admin/:id/status
// Private - Admin
// ------------------------------------------------------

router.patch(
  "/admin/:id/status",
  protect,
  authorize("admin"),
  updateComplaintStatusValidation,
  validateRequest,
  updateComplaintStatus
);

// ------------------------------------------------------
// Assign complaint to department and officer
// PATCH /api/complaints/admin/:id/assign
// Private - Admin
// ------------------------------------------------------

router.patch(
  "/admin/:id/assign",
  protect,
  authorize("admin"),
  assignComplaintValidation,
  validateRequest,
  assignComplaint
);

// ======================================================
// ADMIN - DUPLICATE REVIEW ROUTES
// ======================================================

// ------------------------------------------------------
// Confirm AI-flagged complaint as duplicate
// PATCH /api/complaints/admin/:id/confirm-duplicate
// Private - Admin
// ------------------------------------------------------

router.patch(
  "/admin/:id/confirm-duplicate",
  protect,
  authorize("admin"),
  confirmDuplicate
);

// ------------------------------------------------------
// Reject duplicate flag and continue normal processing
// PATCH /api/complaints/admin/:id/reject-duplicate
// Private - Admin
// ------------------------------------------------------

router.patch(
  "/admin/:id/reject-duplicate",
  protect,
  authorize("admin"),
  rejectDuplicateFlag
);

// ======================================================
// OFFICER ROUTES
// ======================================================

// ------------------------------------------------------
// Get complaints assigned to logged-in officer
// GET /api/complaints/officer/assigned
// Private - Officer
// ------------------------------------------------------

router.get(
  "/officer/assigned",
  protect,
  authorize("officer"),
  getAssignedComplaints
);

// ------------------------------------------------------
// Update status of complaint assigned to logged-in officer
// PATCH /api/complaints/officer/:id/status
// Private - Officer
// ------------------------------------------------------

router.patch(
  "/officer/:id/status",
  protect,
  authorize("officer"),
  officerUpdateStatusValidation,
  validateRequest,
  updateAssignedComplaintStatus
);

// ======================================================
// CITIZEN COMPLAINT DETAILS / TRACKING ROUTES
// ======================================================

// ------------------------------------------------------
// Get complaint status history
// GET /api/complaints/:id/history
// Private - Citizen
// ------------------------------------------------------

router.get(
  "/:id/history",
  protect,
  authorize("citizen"),
  getComplaintHistory
);

// ------------------------------------------------------
// Get single complaint
// GET /api/complaints/:id
// Private - Citizen
// ------------------------------------------------------

router.get(
  "/:id",
  protect,
  authorize("citizen"),
  getComplaintById
);

// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;