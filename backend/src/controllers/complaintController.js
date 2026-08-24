const Complaint = require("../models/Complaint");
const StatusHistory = require("../models/StatusHistory");
const User = require("../models/User");
const Department = require("../models/Department");

const {
  classifyComplaint,
  detectDuplicate,
} = require("../services/aiService");

const {
  notifyComplaintSubmitted,
  notifyComplaintAssigned,
  notifyComplaintInProgress,
  notifyComplaintResolved,
  notifyComplaintRejected,
  notifyComplaintDuplicate,
  notifyDuplicateReviewed,
} = require("../services/notificationService");

const {
  uploadComplaintImagesToCloudinary,
  deleteMultipleImagesFromCloudinary,
} = require("../services/cloudinaryService");

// =========================================================
// SAFE NOTIFICATION HELPER
// =========================================================

const sendNotificationSafely = async (
  notificationFunction,
  complaint
) => {
  try {
    await notificationFunction(complaint);
  } catch (error) {
    console.error(
      "Notification delivery failed:",
      error.message
    );
  }
};

// =========================================================
// CREATE COMPLAINT
// =========================================================

// @desc    Create complaint with AI classification,
//          semantic duplicate detection,
//          image upload and department routing
// @route   POST /api/complaints
// @access  Private - Citizen
const createComplaint = async (req, res, next) => {
  let uploadedImages = [];

  try {
    let {
      title,
      description,
      submittedLanguage,
      location,
    } = req.body;

    // -----------------------------------------------------
    // 1. Parse multipart location if received as JSON text
    // -----------------------------------------------------

    if (
      typeof location === "string" &&
      location.trim()
    ) {
      try {
        location = JSON.parse(location);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid location format",
        });
      }
    }

    if (
      !location ||
      typeof location !== "object"
    ) {
      location = {};
    }

    // -----------------------------------------------------
    // 2. Prepare complaint text
    // -----------------------------------------------------

    const complaintText =
      `${title}. ${description}`.trim();

    // -----------------------------------------------------
    // 3. AI category + priority prediction
    // -----------------------------------------------------

    const aiResult =
      await classifyComplaint(
        complaintText
      );

    // -----------------------------------------------------
    // 4. Find existing complaints in same category
    // -----------------------------------------------------

    const existingComplaints =
      await Complaint.find({
        category: aiResult.category,

        status: {
          $nin: [
            "rejected",
            "duplicate",
          ],
        },
      })
        .select(
          "_id title description aiPrediction.translatedText"
        )
        .sort({
          createdAt: -1,
        })
        .limit(100);

    // -----------------------------------------------------
    // 5. Prepare duplicate candidates
    // -----------------------------------------------------

    const duplicateCandidates =
      existingComplaints.map(
        (existingComplaint) => {
          const comparisonText =
            existingComplaint
              .aiPrediction
              ?.translatedText ||
            `${existingComplaint.title}. ${existingComplaint.description}`;

          return {
            id:
              existingComplaint._id.toString(),

            text:
              comparisonText,
          };
        }
      );

    // -----------------------------------------------------
    // 6. Semantic duplicate detection
    // -----------------------------------------------------

    const duplicateResult =
      await detectDuplicate(
        aiResult.translatedText,
        duplicateCandidates,
        0.75
      );

    // -----------------------------------------------------
    // 7. Manual-review decision
    // -----------------------------------------------------

    const requiresManualReview =
      aiResult.requiresManualReview ||
      duplicateResult.isPotentialDuplicate;

    // -----------------------------------------------------
    // 8. Automatic department routing
    // -----------------------------------------------------

    let routedDepartment = null;

    if (
      aiResult.category &&
      requiresManualReview === false
    ) {
      routedDepartment =
        await Department.findOne({
          categories: aiResult.category,
          isActive: true,
        });
    }

    // -----------------------------------------------------
    // 9. Upload complaint images to Cloudinary
    // -----------------------------------------------------

    if (
      Array.isArray(req.files) &&
      req.files.length > 0
    ) {
      uploadedImages =
        await uploadComplaintImagesToCloudinary(
          req.files
        );
    }

    // -----------------------------------------------------
    // 10. Create complaint
    // -----------------------------------------------------

    const complaint =
      await Complaint.create({
        citizen: req.user._id,

        title,
        description,
        submittedLanguage,

        location,

        images:
          uploadedImages,

        category:
          aiResult.category,

        priority:
          aiResult.priority,

        aiPrediction: {
          categoryConfidence:
            aiResult.categoryConfidence,

          priorityConfidence:
            aiResult.priorityConfidence,

          detectedLanguage:
            aiResult.detectedLanguage,

          translatedText:
            aiResult.translatedText,

          requiresManualReview:
            requiresManualReview,
        },

        duplicateInfo: {
          isPotentialDuplicate:
            duplicateResult
              .isPotentialDuplicate,

          matchedComplaint:
            duplicateResult
              .isPotentialDuplicate
              ? duplicateResult
                  .matchedComplaintId
              : null,

          similarityScore:
            duplicateResult
              .similarityScore,
        },

        department:
          routedDepartment
            ? routedDepartment._id
            : null,

        assignedOfficer:
          null,

        status:
          "submitted",
      });

    // -----------------------------------------------------
    // 11. Status history
    // -----------------------------------------------------

    let historyRemarks =
      "Complaint submitted by citizen";

    if (
      duplicateResult.isPotentialDuplicate
    ) {
      historyRemarks =
        "Complaint submitted and flagged as a potential duplicate for manual review";
    }

    await StatusHistory.create({
      complaint:
        complaint._id,

      previousStatus:
        null,

      newStatus:
        "submitted",

      changedBy:
        req.user._id,

      remarks:
        historyRemarks,
    });

    // -----------------------------------------------------
    // 12. Citizen notification
    // -----------------------------------------------------

    await sendNotificationSafely(
      notifyComplaintSubmitted,
      complaint
    );

    // -----------------------------------------------------
    // 13. Populate response
    // -----------------------------------------------------

    const populatedComplaint =
      await Complaint.findById(
        complaint._id
      )
        .populate(
          "department",
          "name code categories"
        )
        .populate(
          "assignedOfficer",
          "fullName email role"
        )
        .populate(
          "duplicateInfo.matchedComplaint",
          "title description category priority status"
        );

    res.status(201).json({
      success: true,

      message:
        duplicateResult
          .isPotentialDuplicate
          ? "Complaint submitted and flagged as a potential duplicate"
          : "Complaint submitted successfully",

      complaint: {
        id:
          populatedComplaint._id,

        citizen:
          populatedComplaint.citizen,

        title:
          populatedComplaint.title,

        description:
          populatedComplaint.description,

        submittedLanguage:
          populatedComplaint
            .submittedLanguage,

        location:
          populatedComplaint.location,

        images:
          populatedComplaint.images,

        category:
          populatedComplaint.category,

        priority:
          populatedComplaint.priority,

        department:
          populatedComplaint.department,

        assignedOfficer:
          populatedComplaint
            .assignedOfficer,

        aiPrediction:
          populatedComplaint
            .aiPrediction,

        duplicateInfo:
          populatedComplaint
            .duplicateInfo,

        status:
          populatedComplaint.status,

        createdAt:
          populatedComplaint.createdAt,
      },
    });
  } catch (error) {
    if (
      Array.isArray(uploadedImages) &&
      uploadedImages.length > 0
    ) {
      try {
        await deleteMultipleImagesFromCloudinary(
          uploadedImages
        );
      } catch (cleanupError) {
        console.error(
          "Cloudinary cleanup failed:",
          cleanupError.message
        );
      }
    }

    next(error);
  }
};

// =========================================================
// GET MY COMPLAINTS
// =========================================================

const getMyComplaints = async (
  req,
  res,
  next
) => {
  try {
    const complaints =
      await Complaint.find({
        citizen:
          req.user._id,
      })
        .populate(
          "department",
          "name code"
        )
        .populate(
          "assignedOfficer",
          "fullName email role"
        )
        .populate(
          "duplicateInfo.matchedComplaint",
          "title category status"
        )
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET SINGLE COMPLAINT - CITIZEN
// =========================================================

const getComplaintById = async (
  req,
  res,
  next
) => {
  try {
    const complaint =
      await Complaint.findOne({
        _id:
          req.params.id,

        citizen:
          req.user._id,
      })
        .populate(
          "department",
          "name code categories"
        )
        .populate(
          "assignedOfficer",
          "fullName email role"
        )
        .populate(
          "duplicateInfo.matchedComplaint",
          "title description category priority status"
        );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message:
          "Complaint not found",
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

// =========================================================
// GET COMPLAINT HISTORY - CITIZEN
// =========================================================

const getComplaintHistory = async (
  req,
  res,
  next
) => {
  try {
    const complaint =
      await Complaint.findOne({
        _id:
          req.params.id,

        citizen:
          req.user._id,
      });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message:
          "Complaint not found",
      });
    }

    const history =
      await StatusHistory.find({
        complaint:
          complaint._id,
      })
        .populate(
          "changedBy",
          "fullName role"
        )
        .sort({
          createdAt: 1,
        });

    res.status(200).json({
      success: true,

      complaintId:
        complaint._id,

      currentStatus:
        complaint.status,

      count:
        history.length,

      history,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// ADMIN - GET ALL COMPLAINTS
// =========================================================

const getAllComplaints = async (
  req,
  res,
  next
) => {
  try {
    const complaints =
      await Complaint.find()
        .populate(
          "citizen",
          "fullName email preferredLanguage"
        )
        .populate(
          "department",
          "name code categories"
        )
        .populate(
          "assignedOfficer",
          "fullName email role"
        )
        .populate(
          "duplicateInfo.matchedComplaint",
          "title description category priority status"
        )
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// ADMIN - GET SINGLE COMPLAINT
// =========================================================

const getAdminComplaintById = async (
  req,
  res,
  next
) => {
  try {
    const complaint =
      await Complaint.findById(
        req.params.id
      )
        .populate(
          "citizen",
          "fullName email preferredLanguage"
        )
        .populate(
          "department",
          "name code categories"
        )
        .populate(
          "assignedOfficer",
          "fullName email role"
        )
        .populate(
          "duplicateInfo.matchedComplaint",
          "title description category priority status citizen createdAt"
        );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message:
          "Complaint not found",
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

// =========================================================
// ADMIN - GET COMPLAINT HISTORY
// =========================================================

// @desc    Get complete complaint status history
// @route   GET /api/complaints/admin/:id/history
// @access  Private - Admin
const getAdminComplaintHistory = async (
  req,
  res,
  next
) => {
  try {
    const complaint =
      await Complaint.findById(
        req.params.id
      );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message:
          "Complaint not found",
      });
    }

    const history =
      await StatusHistory.find({
        complaint:
          complaint._id,
      })
        .populate(
          "changedBy",
          "fullName email role"
        )
        .sort({
          createdAt: 1,
        });

    res.status(200).json({
      success: true,

      complaintId:
        complaint._id,

      currentStatus:
        complaint.status,

      count:
        history.length,

      history,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// ADMIN - UPDATE COMPLAINT STATUS
// =========================================================

const updateComplaintStatus = async (
  req,
  res,
  next
) => {
  try {
    const {
      status,
      remarks,
    } = req.body;

    const complaint =
      await Complaint.findById(
        req.params.id
      );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message:
          "Complaint not found",
      });
    }

    const previousStatus =
      complaint.status;

    complaint.status =
      status;

    if (
      typeof remarks === "string"
    ) {
      complaint.adminRemarks =
        remarks;
    }

    await complaint.save();

    await StatusHistory.create({
      complaint:
        complaint._id,

      previousStatus,

      newStatus:
        status,

      changedBy:
        req.user._id,

      remarks:
        remarks || "",
    });

    if (
      previousStatus !== status
    ) {
      if (
        status === "rejected"
      ) {
        await sendNotificationSafely(
          notifyComplaintRejected,
          complaint
        );
      }

      if (
        status === "resolved"
      ) {
        await sendNotificationSafely(
          notifyComplaintResolved,
          complaint
        );
      }

      if (
        status === "in_progress"
      ) {
        await sendNotificationSafely(
          notifyComplaintInProgress,
          complaint
        );
      }
    }

    res.status(200).json({
      success: true,

      message:
        "Complaint status updated successfully",

      complaint: {
        id:
          complaint._id,

        previousStatus,

        status:
          complaint.status,

        adminRemarks:
          complaint.adminRemarks,

        updatedAt:
          complaint.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// ADMIN - ASSIGN COMPLAINT
// =========================================================

const assignComplaint = async (
  req,
  res,
  next
) => {
  try {
    const {
      department,
      officer,
      remarks,
    } = req.body;

    const complaint =
      await Complaint.findById(
        req.params.id
      );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message:
          "Complaint not found",
      });
    }

    const selectedDepartment =
      await Department.findOne({
        _id:
          department,

        isActive:
          true,
      });

    if (!selectedDepartment) {
      return res.status(404).json({
        success: false,

        message:
          "Active department not found",
      });
    }

    const selectedOfficer =
      await User.findOne({
        _id:
          officer,

        role:
          "officer",

        department:
          selectedDepartment._id,

        isActive:
          true,
      });

    if (!selectedOfficer) {
      return res.status(400).json({
        success: false,

        message:
          "Selected officer does not belong to the selected department",
      });
    }

    const previousStatus =
      complaint.status;

    complaint.department =
      selectedDepartment._id;

    complaint.assignedOfficer =
      selectedOfficer._id;

    complaint.status =
      "assigned";

    if (
      typeof remarks === "string"
    ) {
      complaint.adminRemarks =
        remarks;
    }

    await complaint.save();

    await StatusHistory.create({
      complaint:
        complaint._id,

      previousStatus,

      newStatus:
        "assigned",

      changedBy:
        req.user._id,

      remarks:
        remarks ||
        "Complaint assigned to department and officer",
    });

    if (
      previousStatus !==
      "assigned"
    ) {
      await sendNotificationSafely(
        notifyComplaintAssigned,
        complaint
      );
    }

    const populatedComplaint =
      await Complaint.findById(
        complaint._id
      )
        .populate(
          "citizen",
          "fullName email"
        )
        .populate(
          "department",
          "name code categories"
        )
        .populate(
          "assignedOfficer",
          "fullName email role"
        )
        .populate(
          "duplicateInfo.matchedComplaint",
          "title category status"
        );

    res.status(200).json({
      success: true,

      message:
        "Complaint assigned successfully",

      complaint:
        populatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// OFFICER - GET ASSIGNED COMPLAINTS
// =========================================================

const getAssignedComplaints = async (
  req,
  res,
  next
) => {
  try {
    const complaints =
      await Complaint.find({
        assignedOfficer:
          req.user._id,
      })
        .populate(
          "citizen",
          "fullName email"
        )
        .populate(
          "department",
          "name code categories"
        )
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      success: true,
      count:
        complaints.length,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// OFFICER - UPDATE ASSIGNED COMPLAINT STATUS
// =========================================================

const updateAssignedComplaintStatus =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        status,
        remarks,
      } = req.body;

      const complaint =
        await Complaint.findOne({
          _id:
            req.params.id,

          assignedOfficer:
            req.user._id,
        });

      if (!complaint) {
        return res.status(404).json({
          success: false,

          message:
            "Assigned complaint not found",
        });
      }

      const previousStatus =
        complaint.status;

      if (
        status === "resolved" &&
        previousStatus !==
          "in_progress"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Complaint must be in progress before it can be resolved",
        });
      }

      if (
        status ===
          "in_progress" &&
        ![
          "assigned",
          "in_progress",
        ].includes(
          previousStatus
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Only an assigned complaint can be moved to in progress",
        });
      }

      complaint.status =
        status;

      await complaint.save();

      await StatusHistory.create({
        complaint:
          complaint._id,

        previousStatus,

        newStatus:
          status,

        changedBy:
          req.user._id,

        remarks:
          remarks || "",
      });

      if (
        previousStatus !== status
      ) {
        if (
          status ===
          "in_progress"
        ) {
          await sendNotificationSafely(
            notifyComplaintInProgress,
            complaint
          );
        }

        if (
          status === "resolved"
        ) {
          await sendNotificationSafely(
            notifyComplaintResolved,
            complaint
          );
        }
      }

      const updatedComplaint =
        await Complaint.findById(
          complaint._id
        )
          .populate(
            "citizen",
            "fullName email"
          )
          .populate(
            "department",
            "name code categories"
          )
          .populate(
            "assignedOfficer",
            "fullName email role"
          );

      res.status(200).json({
        success: true,

        message:
          "Complaint status updated successfully",

        complaint:
          updatedComplaint,
      });
    } catch (error) {
      next(error);
    }
  };

// =========================================================
// ADMIN - CONFIRM DUPLICATE
// =========================================================

const confirmDuplicate = async (
  req,
  res,
  next
) => {
  try {
    const {
      remarks,
    } = req.body;

    const complaint =
      await Complaint.findById(
        req.params.id
      );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message:
          "Complaint not found",
      });
    }

    if (
      !complaint.duplicateInfo
        ?.isPotentialDuplicate ||
      !complaint.duplicateInfo
        ?.matchedComplaint
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Complaint is not currently flagged as a potential duplicate",
      });
    }

    if (
      complaint.status ===
      "duplicate"
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Complaint has already been confirmed as a duplicate",
      });
    }

    const previousStatus =
      complaint.status;

    complaint.status =
      "duplicate";

    complaint.department =
      null;

    complaint.assignedOfficer =
      null;

    complaint.aiPrediction
      .requiresManualReview =
      false;

    if (
      typeof remarks === "string" &&
      remarks.trim()
    ) {
      complaint.adminRemarks =
        remarks.trim();
    }

    await complaint.save();

    await StatusHistory.create({
      complaint:
        complaint._id,

      previousStatus,

      newStatus:
        "duplicate",

      changedBy:
        req.user._id,

      remarks:
        remarks?.trim() ||
        "Potential duplicate reviewed and confirmed by admin",
    });

    await sendNotificationSafely(
      notifyComplaintDuplicate,
      complaint
    );

    const updatedComplaint =
      await Complaint.findById(
        complaint._id
      )
        .populate(
          "citizen",
          "fullName email preferredLanguage"
        )
        .populate(
          "duplicateInfo.matchedComplaint",
          "title description category priority status"
        );

    res.status(200).json({
      success: true,

      message:
        "Complaint confirmed as duplicate",

      complaint:
        updatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// ADMIN - REJECT DUPLICATE FLAG
// =========================================================

const rejectDuplicateFlag = async (
  req,
  res,
  next
) => {
  try {
    const {
      remarks,
    } = req.body;

    const complaint =
      await Complaint.findById(
        req.params.id
      );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message:
          "Complaint not found",
      });
    }

    if (
      !complaint.duplicateInfo
        ?.isPotentialDuplicate
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Complaint is not currently flagged as a potential duplicate",
      });
    }

    const previousStatus =
      complaint.status;

    const previousSimilarityScore =
      complaint.duplicateInfo
        .similarityScore;

    complaint.duplicateInfo
      .isPotentialDuplicate =
      false;

    complaint.duplicateInfo
      .matchedComplaint =
      null;

    complaint.duplicateInfo
      .similarityScore =
      previousSimilarityScore;

    const categoryConfidence =
      complaint.aiPrediction
        ?.categoryConfidence ?? 0;

    const priorityConfidence =
      complaint.aiPrediction
        ?.priorityConfidence ?? 0;

    const classificationNeedsReview =
      categoryConfidence < 0.60 ||
      priorityConfidence < 0.60;

    complaint.aiPrediction
      .requiresManualReview =
      classificationNeedsReview;

    let routedDepartment =
      null;

    if (
      complaint.category &&
      classificationNeedsReview ===
        false
    ) {
      routedDepartment =
        await Department.findOne({
          categories:
            complaint.category,

          isActive:
            true,
        });

      complaint.department =
        routedDepartment
          ? routedDepartment._id
          : null;
    } else {
      complaint.department =
        null;
    }

    complaint.assignedOfficer =
      null;

    complaint.status =
      "submitted";

    if (
      typeof remarks === "string" &&
      remarks.trim()
    ) {
      complaint.adminRemarks =
        remarks.trim();
    }

    await complaint.save();

    await StatusHistory.create({
      complaint:
        complaint._id,

      previousStatus,

      newStatus:
        "submitted",

      changedBy:
        req.user._id,

      remarks:
        remarks?.trim() ||
        "Potential duplicate reviewed and rejected by admin",
    });

    await sendNotificationSafely(
      notifyDuplicateReviewed,
      complaint
    );

    const updatedComplaint =
      await Complaint.findById(
        complaint._id
      )
        .populate(
          "citizen",
          "fullName email preferredLanguage"
        )
        .populate(
          "department",
          "name code categories"
        )
        .populate(
          "assignedOfficer",
          "fullName email role"
        );

    res.status(200).json({
      success: true,

      message:
        "Duplicate flag rejected successfully",

      complaint:
        updatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  // Citizen
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
};