const express = require("express");

const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getComplaintHistory,
  getAllComplaints,
  updateComplaintStatus,
  assignComplaint,
  getAssignedComplaints,
  updateAssignedComplaintStatus,

  // Admin duplicate review
  confirmDuplicate,
  rejectDuplicateFlag,
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

// Submit a new complaint
// Supports maximum 5 complaint images
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

// Get complaints submitted by logged-in citizen
router.get(
  "/my",
  protect,
  authorize("citizen"),
  getMyComplaints
);


// ======================================================
// ADMIN ROUTES
// ======================================================

// Get all complaints
router.get(
  "/admin/all",
  protect,
  authorize("admin"),
  getAllComplaints
);

// Update complaint status
router.patch(
  "/admin/:id/status",
  protect,
  authorize("admin"),
  updateComplaintStatusValidation,
  validateRequest,
  updateComplaintStatus
);

// Assign complaint to department and officer
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

// Confirm AI-flagged complaint as duplicate
router.patch(
  "/admin/:id/confirm-duplicate",
  protect,
  authorize("admin"),
  confirmDuplicate
);

// Reject duplicate flag and continue normal processing
router.patch(
  "/admin/:id/reject-duplicate",
  protect,
  authorize("admin"),
  rejectDuplicateFlag
);


// ======================================================
// OFFICER ROUTES
// ======================================================

// Get complaints assigned to logged-in officer
router.get(
  "/officer/assigned",
  protect,
  authorize("officer"),
  getAssignedComplaints
);

// Update status of complaint assigned to logged-in officer
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

// Get complaint status history
router.get(
  "/:id/history",
  protect,
  authorize("citizen"),
  getComplaintHistory
);

// Get single complaint
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