const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      trim: true,
      unique: true,
      maxlength: 150,
    },

    code: {
      type: String,
      required: [true, "Department code is required"],
      trim: true,
      uppercase: true,
      unique: true,
      maxlength: 20,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    categories: [
      {
        type: String,
        enum: [
          "roads",
          "garbage",
          "water_supply",
          "electricity",
          "drainage",
          "environment",
        ],
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Department = mongoose.model("Department", departmentSchema);

module.exports = Department;