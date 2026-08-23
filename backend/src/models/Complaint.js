const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: [true, "Complaint title is required"],
      trim: true,
      minlength: 5,
      maxlength: 150,
    },

    description: {
      type: String,
      required: [true, "Complaint description is required"],
      trim: true,
      minlength: 15,
      maxlength: 2000,
    },

    submittedLanguage: {
      type: String,
      enum: ["english", "sinhala", "tamil"],
      required: true,
    },

    location: {
      address: {
        type: String,
        trim: true,
      },
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
    },

    images: [
      {
        url: {
          type: String,
        },
        publicId: {
          type: String,
        },
      },
    ],

    category: {
      type: String,
      enum: [
        "roads",
        "garbage",
        "water_supply",
        "electricity",
        "drainage",
        "environment",
      ],
      default: null,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: null,
    },

    aiPrediction: {
      categoryConfidence: {
        type: Number,
        min: 0,
        max: 1,
      },
      priorityConfidence: {
        type: Number,
        min: 0,
        max: 1,
      },
    },

    duplicateInfo: {
      isPotentialDuplicate: {
        type: Boolean,
        default: false,
      },
      matchedComplaint: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Complaint",
        default: null,
      },
      similarityScore: {
        type: Number,
        min: 0,
        max: 1,
        default: null,
      },
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
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
      default: "submitted",
    },

    adminRemarks: {
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

const Complaint = mongoose.model("Complaint", complaintSchema);

module.exports = Complaint;