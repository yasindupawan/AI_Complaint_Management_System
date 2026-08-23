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
} = require("../controllers/complaintController");

const {
  createComplaintValidation,
  updateComplaintStatusValidation,
  assignComplaintValidation,
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
  authorize("citizen"),
  createComplaintValidation,
  validateRequest,
  createComplaint
);

router.get(
  "/my",
  protect,
  authorize("citizen"),
  getMyComplaints
);

router.get(
  "/admin/all",
  protect,
  authorize("admin"),
  getAllComplaints
);

router.patch(
  "/admin/:id/status",
  protect,
  authorize("admin"),
  updateComplaintStatusValidation,
  validateRequest,
  updateComplaintStatus
);

router.patch(
  "/admin/:id/assign",
  protect,
  authorize("admin"),
  assignComplaintValidation,
  validateRequest,
  assignComplaint
);

router.get(
  "/officer/assigned",
  protect,
  authorize("officer"),
  getAssignedComplaints
);

router.get(
  "/:id/history",
  protect,
  authorize("citizen"),
  getComplaintHistory
);

router.get(
  "/:id",
  protect,
  authorize("citizen"),
  getComplaintById
);

module.exports = router;