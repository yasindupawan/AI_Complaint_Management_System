const Complaint = require("../models/Complaint");
const StatusHistory = require("../models/StatusHistory");
const User = require("../models/User");
const Department = require("../models/Department");


// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private - Citizen
const createComplaint = async (req, res, next) => {
  try {
    const {
      title,
      description,
      submittedLanguage,
      location,
    } = req.body;

    const complaint = await Complaint.create({
      citizen: req.user._id,
      title,
      description,
      submittedLanguage,
      location: location || {},
      status: "submitted",
    });

await StatusHistory.create({
  complaint: complaint._id,
  previousStatus: null,
  newStatus: "submitted",
  changedBy: req.user._id,
  remarks: "Complaint submitted by citizen",
});
    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      complaint: {
        id: complaint._id,
        citizen: complaint.citizen,
        title: complaint.title,
        description: complaint.description,
        submittedLanguage: complaint.submittedLanguage,
        location: complaint.location,
        status: complaint.status,
        createdAt: complaint.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaints submitted by logged-in citizen
// @route   GET /api/complaints/my
// @access  Private - Citizen
const getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({
      citizen: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single complaint owned by logged-in citizen
// @route   GET /api/complaints/:id
// @access  Private - Citizen
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findOne({
      _id: req.params.id,
      citizen: req.user._id,
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      success: true,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get status history for a citizen's complaint
// @route   GET /api/complaints/:id/history
// @access  Private - Citizen
const getComplaintHistory = async (req, res, next) => {
  try {
    // First verify that the complaint belongs to the logged-in citizen
    const complaint = await Complaint.findOne({
      _id: req.params.id,
      citizen: req.user._id,
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    const history = await StatusHistory.find({
      complaint: complaint._id,
    })
      .populate("changedBy", "fullName role")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      complaintId: complaint._id,
      currentStatus: complaint.status,
      count: history.length,
      history,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaints
// @route   GET /api/complaints/admin/all
// @access  Private - Admin
const getAllComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find()
      .populate("citizen", "fullName email preferredLanguage")
      .populate("assignedOfficer", "fullName email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status
// @route   PATCH /api/complaints/admin/:id/status
// @access  Private - Admin
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    const previousStatus = complaint.status;

    complaint.status = status;

    if (typeof remarks === "string") {
      complaint.adminRemarks = remarks;
    }

    await complaint.save();

    await StatusHistory.create({
      complaint: complaint._id,
      previousStatus,
      newStatus: status,
      changedBy: req.user._id,
      remarks: remarks || "",
    });

    res.status(200).json({
      success: true,
      message: "Complaint status updated successfully",
      complaint: {
        id: complaint._id,
        previousStatus,
        status: complaint.status,
        adminRemarks: complaint.adminRemarks,
        updatedAt: complaint.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign complaint to department and officer
// @route   PATCH /api/complaints/admin/:id/assign
// @access  Private - Admin
const assignComplaint = async (req, res, next) => {
  try {
    const { department, officer, remarks } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    const selectedDepartment = await Department.findOne({
      _id: department,
      isActive: true,
    });

    if (!selectedDepartment) {
      return res.status(404).json({
        success: false,
        message: "Active department not found",
      });
    }

    const selectedOfficer = await User.findOne({
      _id: officer,
      role: "officer",
      department: selectedDepartment._id,
      isActive: true,
    });

    if (!selectedOfficer) {
      return res.status(400).json({
        success: false,
        message: "Selected officer does not belong to the selected department",
      });
    }

    const previousStatus = complaint.status;

    complaint.department = selectedDepartment._id;
    complaint.assignedOfficer = selectedOfficer._id;
    complaint.status = "assigned";

    if (typeof remarks === "string") {
      complaint.adminRemarks = remarks;
    }

    await complaint.save();

    await StatusHistory.create({
      complaint: complaint._id,
      previousStatus,
      newStatus: "assigned",
      changedBy: req.user._id,
      remarks: remarks || "Complaint assigned to department and officer",
    });

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate("citizen", "fullName email")
      .populate("department", "name code")
      .populate("assignedOfficer", "fullName email role");

    res.status(200).json({
      success: true,
      message: "Complaint assigned successfully",
      complaint: populatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaints assigned to logged-in officer
// @route   GET /api/complaints/officer/assigned
// @access  Private - Officer
const getAssignedComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({
      assignedOfficer: req.user._id,
    })
      .populate("citizen", "fullName email")
      .populate("department", "name code")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update status of complaint assigned to logged-in officer
// @route   PATCH /api/complaints/officer/:id/status
// @access  Private - Officer
const updateAssignedComplaintStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    // Officer can only update a complaint assigned to them
    const complaint = await Complaint.findOne({
      _id: req.params.id,
      assignedOfficer: req.user._id,
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Assigned complaint not found",
      });
    }

    const previousStatus = complaint.status;

    // Prevent resolving before complaint is in progress
    if (status === "resolved" && previousStatus !== "in_progress") {
      return res.status(400).json({
        success: false,
        message:
          "Complaint must be in progress before it can be resolved",
      });
    }

    // Prevent invalid transition back to in_progress
    if (
      status === "in_progress" &&
      !["assigned", "in_progress"].includes(previousStatus)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only an assigned complaint can be moved to in progress",
      });
    }

    complaint.status = status;

    await complaint.save();

    // Create audit trail
    await StatusHistory.create({
      complaint: complaint._id,
      previousStatus,
      newStatus: status,
      changedBy: req.user._id,
      remarks: remarks || "",
    });

    const updatedComplaint = await Complaint.findById(
      complaint._id
    )
      .populate("citizen", "fullName email")
      .populate("department", "name code")
      .populate("assignedOfficer", "fullName email role");

    res.status(200).json({
      success: true,
      message: "Complaint status updated successfully",
      complaint: updatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getComplaintHistory,
  getAllComplaints,
  updateComplaintStatus,
  assignComplaint,
  getAssignedComplaints,
  updateAssignedComplaintStatus,
};