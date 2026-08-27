const mongoose = require("mongoose");

/* =========================================================
   REGISTRATION VERIFICATION SCHEMA
   Used only for citizen email OTP verification
========================================================= */

const registrationVerificationSchema =
  new mongoose.Schema(
    {
      /* =====================================================
         EMAIL
      ===================================================== */

      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true,
      },

      /* =====================================================
         HASHED OTP
         Raw OTP is never stored in MongoDB
      ===================================================== */

      otpHash: {
        type: String,
        required: true,
        select: false,
      },

      /* =====================================================
         OTP EXPIRY
      ===================================================== */

      otpExpiresAt: {
        type: Date,
        required: true,
      },

      /* =====================================================
         VERIFICATION STATUS
      ===================================================== */

      isVerified: {
        type: Boolean,
        default: false,
      },

      verifiedAt: {
        type: Date,
        default: null,
      },

      /* =====================================================
         FAILED OTP ATTEMPTS
      ===================================================== */

      attempts: {
        type: Number,
        default: 0,
      },

      /* =====================================================
         LAST OTP SENT TIME
         Used for resend cooldown
      ===================================================== */

      lastOtpSentAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

/* =========================================================
   AUTOMATIC CLEANUP

   MongoDB will automatically remove old verification
   records after they are no longer needed.
========================================================= */

registrationVerificationSchema.index(
  {
    createdAt: 1,
  },
  {
    expireAfterSeconds: 60 * 60,
  }
);

/* =========================================================
   MODEL
========================================================= */

const RegistrationVerification =
  mongoose.model(
    "RegistrationVerification",
    registrationVerificationSchema
  );

module.exports =
  RegistrationVerification;