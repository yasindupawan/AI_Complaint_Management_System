const mongoose = require("mongoose");

const statusHistorySchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      required: true,
      index: true,
    },

    previousStatus: {
      type: String,
      enum: [
        "submitted",
        "under_review",
        "assigned",
        "in_progress",
        "resolved",
        "rejected",
        "duplicate",
      ],
      default: null,
    },

    newStatus: {
      type: String,
      enum: [
        "submitted",
        "under_review",
        "assigned",
        "in_progress",
        "resolved",
        "rejected",
        "duplicate",
      ],
      required: true,
    },

    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    remarks: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const StatusHistory = mongoose.model(
  "StatusHistory",
  statusHistorySchema
);

module.exports = StatusHistory;