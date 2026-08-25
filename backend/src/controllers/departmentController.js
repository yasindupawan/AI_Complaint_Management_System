const Department = require("../models/Department");
const User = require("../models/User");
const Complaint = require("../models/Complaint");

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

    const normalizedName = name.trim();
    const normalizedCode = code
      .trim()
      .toUpperCase();

    const normalizedCategories = Array.isArray(categories)
      ? [
          ...new Set(
            categories
              .map((category) =>
                String(category)
                  .trim()
                  .toLowerCase()
                  .replace(/\s+/g, "_")
              )
              .filter(Boolean)
          ),
        ]
      : [];

    const existingDepartment =
      await Department.findOne({
        $or: [
          {
            name: {
              $regex: `^${normalizedName.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
              )}$`,
              $options: "i",
            },
          },
          {
            code: normalizedCode,
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
        name: normalizedName,
        code: normalizedCode,
        description:
          typeof description === "string"
            ? description.trim()
            : "",
        categories:
          normalizedCategories,
        isActive: true,
      });

    const responseDepartment =
      department.toObject();

    responseDepartment.officerCount = 0;

    res.status(201).json({
      success: true,
      message:
        "Department created successfully",
      department:
        responseDepartment,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET ALL DEPARTMENTS
// =========================================================

// @desc    Get all departments including active/inactive
// @route   GET /api/departments
// @access  Private - Admin
const getDepartments = async (
  req,
  res,
  next
) => {
  try {
    const departments =
      await Department.find().sort({
        name: 1,
      });

    const departmentIds =
      departments.map(
        (department) =>
          department._id
      );

    const officerCounts =
      await User.aggregate([
        {
          $match: {
            role: "officer",
            department: {
              $in: departmentIds,
            },
          },
        },
        {
          $group: {
            _id: "$department",
            count: {
              $sum: 1,
            },
          },
        },
      ]);

    const officerCountMap =
      new Map(
        officerCounts.map(
          (item) => [
            item._id.toString(),
            item.count,
          ]
        )
      );

    const formattedDepartments =
      departments.map(
        (department) => {
          const departmentObject =
            department.toObject();

          return {
            ...departmentObject,
            officerCount:
              officerCountMap.get(
                department._id.toString()
              ) || 0,
          };
        }
      );

    res.status(200).json({
      success: true,
      count:
        formattedDepartments.length,
      departments:
        formattedDepartments,
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
    const {
      departmentId,
    } = req.params;

    const department =
      await Department.findById(
        departmentId
      );

    if (!department) {
      return res.status(404).json({
        success: false,
        message:
          "Department not found",
      });
    }

    if (!department.isActive) {
      return res.status(400).json({
        success: false,
        message:
          "Department is currently inactive",
      });
    }

    const officers =
      await User.find({
        role: "officer",
        department:
          departmentId,
        isActive: true,
      })
        .select(
          "_id fullName email role department preferredLanguage isActive"
        )
        .sort({
          fullName: 1,
        });

    res.status(200).json({
      success: true,

      department: {
        id:
          department._id,
        name:
          department.name,
        code:
          department.code,
      },

      count:
        officers.length,

      officers,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// UPDATE DEPARTMENT
// =========================================================

// @desc    Update department information
// @route   PATCH /api/departments/:id
// @access  Private - Admin
const updateDepartment = async (
  req,
  res,
  next
) => {
  try {
    const department =
      await Department.findById(
        req.params.id
      );

    if (!department) {
      return res.status(404).json({
        success: false,
        message:
          "Department not found",
      });
    }

    const {
      name,
      code,
      description,
      categories,
    } = req.body;

    const normalizedName =
      typeof name === "string"
        ? name.trim()
        : department.name;

    const normalizedCode =
      typeof code === "string"
        ? code
            .trim()
            .toUpperCase()
        : department.code;

    const existingDepartment =
      await Department.findOne({
        _id: {
          $ne: department._id,
        },
        $or: [
          {
            name: {
              $regex: `^${normalizedName.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
              )}$`,
              $options: "i",
            },
          },
          {
            code: normalizedCode,
          },
        ],
      });

    if (existingDepartment) {
      return res.status(409).json({
        success: false,
        message:
          "Another department already uses this name or code",
      });
    }

    if (
      typeof name === "string" &&
      name.trim()
    ) {
      department.name =
        normalizedName;
    }

    if (
      typeof code === "string" &&
      code.trim()
    ) {
      department.code =
        normalizedCode;
    }

    if (
      typeof description ===
      "string"
    ) {
      department.description =
        description.trim();
    }

    if (
      Array.isArray(categories)
    ) {
      department.categories = [
        ...new Set(
          categories
            .map((category) =>
              String(category)
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "_")
            )
            .filter(Boolean)
        ),
      ];
    }

    await department.save();

    const officerCount =
      await User.countDocuments({
        role: "officer",
        department:
          department._id,
      });

    const updatedDepartment =
      department.toObject();

    updatedDepartment.officerCount =
      officerCount;

    res.status(200).json({
      success: true,
      message:
        "Department updated successfully",
      department:
        updatedDepartment,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// UPDATE DEPARTMENT STATUS
// =========================================================

// @desc    Activate or deactivate department
// @route   PATCH /api/departments/:id/status
// @access  Private - Admin
const updateDepartmentStatus = async (
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

    const department =
      await Department.findById(
        req.params.id
      );

    if (!department) {
      return res.status(404).json({
        success: false,
        message:
          "Department not found",
      });
    }

    if (
      isActive === false
    ) {
      const activeOfficerCount =
        await User.countDocuments({
          role: "officer",
          department:
            department._id,
          isActive: true,
        });

      if (
        activeOfficerCount > 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Department cannot be deactivated while active officers are assigned to it",
        });
      }
    }

    department.isActive =
      isActive;

    await department.save();

    const officerCount =
      await User.countDocuments({
        role: "officer",
        department:
          department._id,
      });

    const updatedDepartment =
      department.toObject();

    updatedDepartment.officerCount =
      officerCount;

    res.status(200).json({
      success: true,

      message: isActive
        ? "Department activated successfully"
        : "Department deactivated successfully",

      department:
        updatedDepartment,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// DELETE DEPARTMENT
// =========================================================

// @desc    Permanently delete unused department
// @route   DELETE /api/departments/:id
// @access  Private - Admin
const deleteDepartment = async (
  req,
  res,
  next
) => {
  try {
    const department =
      await Department.findById(
        req.params.id
      );

    if (!department) {
      return res.status(404).json({
        success: false,
        message:
          "Department not found",
      });
    }

    const [
      assignedOfficerCount,
      linkedComplaintCount,
    ] = await Promise.all([
      User.countDocuments({
        role: "officer",
        department:
          department._id,
      }),

      Complaint.countDocuments({
        department:
          department._id,
      }),
    ]);

    if (
      assignedOfficerCount > 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Department cannot be deleted because officers are assigned to it. Reassign or remove the officers first.",
      });
    }

    if (
      linkedComplaintCount > 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Department cannot be deleted because complaint records are linked to it. Deactivate the department instead.",
      });
    }

    await Department.deleteOne({
      _id: department._id,
    });

    res.status(200).json({
      success: true,
      message:
        "Department deleted successfully",
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
  updateDepartment,
  updateDepartmentStatus,
  deleteDepartment,
};