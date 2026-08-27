const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    /* =========================================================
       BASIC INFORMATION
    ========================================================= */

    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    /* =========================================================
       NIC
       Required only for citizens
    ========================================================= */

    nic: {
      type: String,

      required: function () {
        return this.role === "citizen";
      },

      trim: true,
      uppercase: true,

      // Citizens cannot share the same NIC.
      // Officers/admins may have no NIC.
      unique: true,
      sparse: true,

      default: undefined,
    },

    /* =========================================================
       EMAIL
    ========================================================= */

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

    /* =========================================================
       PASSWORD
    ========================================================= */

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },

    /* =========================================================
       ROLE
    ========================================================= */

    role: {
      type: String,
      enum: ["citizen", "officer", "admin"],
      default: "citizen",
    },

    /* =========================================================
       DEPARTMENT
       Used mainly for officers
    ========================================================= */

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    /* =========================================================
       PREFERRED LANGUAGE
    ========================================================= */

    preferredLanguage: {
      type: String,
      enum: ["english", "sinhala", "tamil"],
      default: "english",
    },

    /* =========================================================
       ACCOUNT STATUS
    ========================================================= */

    isActive: {
      type: Boolean,
      default: true,
    },

    /* =========================================================
       EMAIL VERIFICATION
       Used for public citizen registration
    ========================================================= */

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerifiedAt: {
      type: Date,
      default: null,
    },

    /* =========================================================
       PASSWORD RESET
    ========================================================= */

    passwordResetToken: {
      type: String,
      select: false,
      default: null,
    },

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

const User = mongoose.model(
  "User",
  userSchema
);

module.exports = User;