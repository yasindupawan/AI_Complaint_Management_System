const Department = require("../models/Department");

// @desc    Create a new department
// @route   POST /api/departments
// @access  Private - Admin
const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, categories } = req.body;

    // Check for duplicate department name or code
    const existingDepartment = await Department.findOne({
      $or: [
        { name },
        { code: code.toUpperCase() },
      ],
    });

    if (existingDepartment) {
      return res.status(409).json({
        success: false,
        message: "Department name or code already exists",
      });
    }

    const department = await Department.create({
      name,
      code,
      description: description || "",
      categories: categories || [],
    });

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      department,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private - Admin
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDepartment,
  getDepartments,
};