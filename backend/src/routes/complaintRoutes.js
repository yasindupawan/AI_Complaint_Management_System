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

const router = express.Router();

// ======================================================
// CITIZEN ROUTES
// ======================================================

// Submit a new complaint
router.post(
  "/",
  protect,
  authorize("citizen"),
  createComplaintValidation,
  validateRequest,
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

module.exports = router;