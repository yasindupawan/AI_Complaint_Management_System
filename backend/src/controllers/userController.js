const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Department = require("../models/Department");
const Complaint = require("../models/Complaint");
const StatusHistory = require("../models/StatusHistory");

// =========================================================
// ADMIN - CREATE OFFICER
// =========================================================

// @desc    Create a new officer account
// @route   POST /api/users/officers
// @access  Private - Admin
const createOfficer = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      password,
      department,
      preferredLanguage,
    } = req.body;

    // -----------------------------------------------------
    // Check whether department exists and is active
    // -----------------------------------------------------

    const existingDepartment = await Department.findOne({
      _id: department,
      isActive: true,
    });

    if (!existingDepartment) {
      return res.status(404).json({
        success: false,
        message: "Active department not found",
      });
    }

    // -----------------------------------------------------
    // Normalize email
    // -----------------------------------------------------

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    // -----------------------------------------------------
    // Check duplicate email
    // -----------------------------------------------------

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    // -----------------------------------------------------
    // Hash officer password
    // -----------------------------------------------------

    const salt = await bcrypt.genSalt(12);

    const hashedPassword =
      await bcrypt.hash(
        password,
        salt
      );

    // -----------------------------------------------------
    // Create officer account
    // -----------------------------------------------------

    const officer = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "officer",
      department:
        existingDepartment._id,
      preferredLanguage:
        preferredLanguage ||
        "english",
      isActive: true,
    });

    const populatedOfficer =
      await User.findById(
        officer._id
      )
        .select("-password")
        .populate(
          "department",
          "name code categories isActive"
        );

    res.status(201).json({
      success: true,
      message:
        "Officer account created successfully",
      officer:
        populatedOfficer,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// ADMIN - GET ALL USERS
// =========================================================

// @desc    Get all system users
// @route   GET /api/users
// @access  Private - Admin
const getAllUsers = async (
  req,
  res,
  next
) => {
  try {
    const {
      role,
      status,
      department,
      search,
    } = req.query;

    const query = {};

    // -----------------------------------------------------
    // Role filter
    // -----------------------------------------------------

    if (
      role &&
      [
        "citizen",
        "officer",
        "admin",
      ].includes(role)
    ) {
      query.role = role;
    }

    // -----------------------------------------------------
    // Active / inactive filter
    // -----------------------------------------------------

    if (status === "active") {
      query.isActive = true;
    }

    if (status === "inactive") {
      query.isActive = false;
    }

    // -----------------------------------------------------
    // Department filter
    // -----------------------------------------------------

    if (department) {
      query.department =
        department;
    }

    // -----------------------------------------------------
    // Search filter
    // -----------------------------------------------------

    if (search?.trim()) {
      const searchRegex =
        new RegExp(
          search.trim(),
          "i"
        );

      query.$or = [
        {
          fullName:
            searchRegex,
        },
        {
          email:
            searchRegex,
        },
      ];
    }

    // -----------------------------------------------------
    // Get users
    // -----------------------------------------------------

    const users =
      await User.find(query)
        .select("-password")
        .populate(
          "department",
          "name code categories isActive"
        )
        .sort({
          createdAt: -1,
        });

    // -----------------------------------------------------
    // Statistics based on current result
    // -----------------------------------------------------

    const statistics = {
      totalUsers:
        users.length,

      citizens:
        users.filter(
          (user) =>
            user.role ===
            "citizen"
        ).length,

      officers:
        users.filter(
          (user) =>
            user.role ===
            "officer"
        ).length,

      admins:
        users.filter(
          (user) =>
            user.role ===
            "admin"
        ).length,

      activeUsers:
        users.filter(
          (user) =>
            user.isActive
        ).length,

      inactiveUsers:
        users.filter(
          (user) =>
            !user.isActive
        ).length,
    };

    res.status(200).json({
      success: true,
      count:
        users.length,
      statistics,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// ADMIN - GET SINGLE USER
// =========================================================

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private - Admin
const getUserById = async (
  req,
  res,
  next
) => {
  try {
    const user =
      await User.findById(
        req.params.id
      )
        .select("-password")
        .populate(
          "department",
          "name code categories isActive"
        );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// ADMIN - UPDATE USER ACTIVE STATUS
// =========================================================

// @desc    Activate or deactivate user account
// @route   PATCH /api/users/:id/status
// @access  Private - Admin
const updateUserStatus = async (
  req,
  res,
  next
) => {
  try {
    const {
      isActive,
    } = req.body;

    if (
      typeof isActive !==
      "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "isActive must be a boolean value",
      });
    }

    const user =
      await User.findById(
        req.params.id
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    // -----------------------------------------------------
    // Prevent admin from disabling own account
    // -----------------------------------------------------

    if (
      user._id.toString() ===
        req.user._id.toString() &&
      isActive === false
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot deactivate your own administrator account",
      });
    }

    user.isActive =
      isActive;

    await user.save();

    const updatedUser =
      await User.findById(
        user._id
      )
        .select("-password")
        .populate(
          "department",
          "name code categories isActive"
        );

    res.status(200).json({
      success: true,

      message:
        isActive
          ? "User account activated successfully"
          : "User account deactivated successfully",

      user:
        updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// ADMIN - UPDATE OFFICER DEPARTMENT
// =========================================================

// @desc    Change officer department
// @route   PATCH /api/users/:id/department
// @access  Private - Admin
const updateOfficerDepartment =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        department,
      } = req.body;

      if (!department) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Department is required",
          });
      }

      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "User not found",
          });
      }

      if (
        user.role !==
        "officer"
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Only officer accounts can be assigned to departments",
          });
      }

      const existingDepartment =
        await Department.findOne({
          _id:
            department,
          isActive:
            true,
        });

      if (
        !existingDepartment
      ) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Active department not found",
          });
      }

      user.department =
        existingDepartment._id;

      await user.save();

      const updatedOfficer =
        await User.findById(
          user._id
        )
          .select("-password")
          .populate(
            "department",
            "name code categories isActive"
          );

      res.status(200).json({
        success: true,

        message:
          "Officer department updated successfully",

        user:
          updatedOfficer,
      });
    } catch (error) {
      next(error);
    }
  };

// =========================================================
// ADMIN - USER STATISTICS
// =========================================================

// @desc    Get system user statistics
// @route   GET /api/users/admin/statistics
// @access  Private - Admin
const getUserStatistics =
  async (
    req,
    res,
    next
  ) => {
    try {
      const [
        totalUsers,
        totalCitizens,
        totalOfficers,
        totalAdmins,
        activeUsers,
        inactiveUsers,
        activeCitizens,
        inactiveCitizens,
        activeOfficers,
        inactiveOfficers,
      ] =
        await Promise.all([
          User.countDocuments(),

          User.countDocuments({
            role:
              "citizen",
          }),

          User.countDocuments({
            role:
              "officer",
          }),

          User.countDocuments({
            role:
              "admin",
          }),

          User.countDocuments({
            isActive:
              true,
          }),

          User.countDocuments({
            isActive:
              false,
          }),

          User.countDocuments({
            role:
              "citizen",
            isActive:
              true,
          }),

          User.countDocuments({
            role:
              "citizen",
            isActive:
              false,
          }),

          User.countDocuments({
            role:
              "officer",
            isActive:
              true,
          }),

          User.countDocuments({
            role:
              "officer",
            isActive:
              false,
          }),
        ]);

      res.status(200).json({
        success: true,

        statistics: {
          totalUsers,
          totalCitizens,
          totalOfficers,
          totalAdmins,

          activeUsers,
          inactiveUsers,

          activeCitizens,
          inactiveCitizens,

          activeOfficers,
          inactiveOfficers,
        },
      });
    } catch (error) {
      next(error);
    }
  };

// =========================================================
// ADMIN - DELETE USER
// =========================================================

// @desc    Permanently delete citizen or officer account
// @route   DELETE /api/users/:id
// @access  Private - Admin
const deleteUser = async (
  req,
  res,
  next
) => {
  try {
    const user =
      await User.findById(
        req.params.id
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    // -----------------------------------------------------
    // Prevent deleting admin accounts
    // -----------------------------------------------------

    if (
      user.role ===
      "admin"
    ) {
      return res.status(403).json({
        success: false,

        message:
          "Administrator accounts cannot be removed from User Management.",
      });
    }

    // -----------------------------------------------------
    // Prevent deleting own account
    // -----------------------------------------------------

    if (
      user._id.toString() ===
      req.user._id.toString()
    ) {
      return res.status(400).json({
        success: false,

        message:
          "You cannot remove your own account.",
      });
    }

    // -----------------------------------------------------
    // CITIZEN SAFETY CHECK
    // -----------------------------------------------------

    if (
      user.role ===
      "citizen"
    ) {
      const citizenComplaintCount =
        await Complaint.countDocuments(
          {
            citizen:
              user._id,
          }
        );

      if (
        citizenComplaintCount >
        0
      ) {
        return res
          .status(409)
          .json({
            success:
              false,

            message:
              "This citizen has complaint records and cannot be permanently removed. Deactivate the account instead.",
          });
      }
    }

    // -----------------------------------------------------
    // OFFICER SAFETY CHECK
    // -----------------------------------------------------

    if (
      user.role ===
      "officer"
    ) {
      const assignedComplaintCount =
        await Complaint.countDocuments(
          {
            assignedOfficer:
              user._id,
          }
        );

      if (
        assignedComplaintCount >
        0
      ) {
        return res
          .status(409)
          .json({
            success:
              false,

            message:
              "This officer is linked to assigned complaint records and cannot be permanently removed. Reassign the complaints or deactivate the officer instead.",
          });
      }

      // ---------------------------------------------------
      // Preserve complaint history integrity
      // ---------------------------------------------------

      const historyCount =
        await StatusHistory.countDocuments(
          {
            changedBy:
              user._id,
          }
        );

      if (
        historyCount >
        0
      ) {
        return res
          .status(409)
          .json({
            success:
              false,

            message:
              "This officer has complaint history records and cannot be permanently removed. Deactivate the officer instead.",
          });
      }
    }

    // -----------------------------------------------------
    // Delete user
    // -----------------------------------------------------

    await User.findByIdAndDelete(
      user._id
    );

    res.status(200).json({
      success: true,

      message:
        user.role ===
        "officer"
          ? "Officer account removed successfully"
          : "Citizen account removed successfully",

      deletedUser: {
        id:
          user._id,

        fullName:
          user.fullName,

        email:
          user.email,

        role:
          user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  createOfficer,
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateOfficerDepartment,
  getUserStatistics,
  deleteUser,
};