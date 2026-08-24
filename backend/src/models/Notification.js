const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // =====================================================
    // USER WHO RECEIVES THE NOTIFICATION
    // =====================================================

    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =====================================================
    // RELATED COMPLAINT
    // =====================================================

    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      required: true,
    },

    // =====================================================
    // NOTIFICATION TYPE
    // =====================================================

    type: {
      type: String,
      enum: [
        "complaint_submitted",
        "complaint_assigned",
        "complaint_in_progress",
        "complaint_resolved",
        "complaint_rejected",
        "complaint_duplicate",
        "duplicate_reviewed",
      ],
      required: true,
    },

    // =====================================================
    // NOTIFICATION CONTENT
    // =====================================================

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    // =====================================================
    // READ STATUS
    // =====================================================

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

module.exports = Notification;