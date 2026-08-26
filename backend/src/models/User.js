const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },

    role: {
      type: String,
      enum: ["citizen", "officer", "admin"],
      default: "citizen",
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    preferredLanguage: {
      type: String,
      enum: ["english", "sinhala", "tamil"],
      default: "english",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    /* =========================================================
       PASSWORD RESET
    ========================================================= */

    // Stores only the hashed reset token.
    // The raw reset token is never saved in MongoDB.
    passwordResetToken: {
      type: String,
      select: false,
      default: null,
    },

    // Password reset token expiry time.
    passwordResetExpires: {
      type: Date,
      select: false,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;