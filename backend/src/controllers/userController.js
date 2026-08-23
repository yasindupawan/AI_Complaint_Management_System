const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Department = require("../models/Department");

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

    // Check whether department exists and is active
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

    // Check duplicate email
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Hash officer password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create officer account
    const officer = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: "officer",
      department: existingDepartment._id,
      preferredLanguage: preferredLanguage || "english",
      isActive: true,
    });

    const populatedOfficer = await User.findById(officer._id).populate(
      "department",
      "name code"
    );

    res.status(201).json({
      success: true,
      message: "Officer account created successfully",
      officer: {
        id: populatedOfficer._id,
        fullName: populatedOfficer.fullName,
        email: populatedOfficer.email,
        role: populatedOfficer.role,
        preferredLanguage: populatedOfficer.preferredLanguage,
        department: populatedOfficer.department,
        isActive: populatedOfficer.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOfficer,
};