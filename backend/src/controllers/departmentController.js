const Department = require("../models/Department");
const User = require("../models/User");

// =========================================================
// CREATE DEPARTMENT
// =========================================================

// @desc    Create a new department
// @route   POST /api/departments
// @access  Private - Admin
const createDepartment = async (req, res, next) => {
  try {
    const {
      name,
      code,
      description,
      categories,
    } = req.body;

    const existingDepartment =
      await Department.findOne({
        $or: [
          { name },
          {
            code: code.toUpperCase(),
          },
        ],
      });

    if (existingDepartment) {
      return res.status(409).json({
        success: false,
        message:
          "Department name or code already exists",
      });
    }

    const department =
      await Department.create({
        name,
        code: code.toUpperCase(),
        description: description || "",
        categories: categories || [],
      });

    res.status(201).json({
      success: true,
      message:
        "Department created successfully",
      department,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET ALL DEPARTMENTS
// =========================================================

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private - Admin
const getDepartments = async (
  req,
  res,
  next
) => {
  try {
    const departments =
      await Department.find({
        isActive: true,
      }).sort({
        name: 1,
      });

    res.status(200).json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET OFFICERS BY DEPARTMENT
// =========================================================

// @desc    Get active officers belonging to a department
// @route   GET /api/departments/:departmentId/officers
// @access  Private - Admin
const getOfficersByDepartment = async (
  req,
  res,
  next
) => {
  try {
    const { departmentId } =
      req.params;

    // Check department exists
    const department =
      await Department.findOne({
        _id: departmentId,
        isActive: true,
      });

    if (!department) {
      return res.status(404).json({
        success: false,
        message:
          "Active department not found",
      });
    }

    // Find active officers assigned to department
    const officers = await User.find({
      role: "officer",
      department: departmentId,
      isActive: true,
    })
      .select(
        "_id fullName email role department"
      )
      .sort({
        fullName: 1,
      });

    res.status(200).json({
      success: true,

      department: {
        id: department._id,
        name: department.name,
        code: department.code,
      },

      count: officers.length,

      officers,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  createDepartment,
  getDepartments,
  getOfficersByDepartment,
};