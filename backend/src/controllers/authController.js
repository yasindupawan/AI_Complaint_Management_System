const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const User = require("../models/User");
const RegistrationVerification = require(
  "../models/RegistrationVerification"
);

const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");

/* =========================================================
   CONSTANTS
========================================================= */

const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const MAX_OTP_ATTEMPTS = 5;

/* =========================================================
   HELPER - NORMALIZE EMAIL
========================================================= */

const normalizeEmail = (email) => {
  return String(email || "")
    .trim()
    .toLowerCase();
};

/* =========================================================
   HELPER - NORMALIZE NIC
========================================================= */

const normalizeNic = (nic) => {
  return String(nic || "")
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();
};

/* =========================================================
   HELPER - VALIDATE SRI LANKAN NIC

   Old NIC:
   123456789V
   123456789X

   New NIC:
   200012345678
========================================================= */

const isValidSriLankanNic = (nic) => {
  const normalizedNic = normalizeNic(nic);

  const oldNicPattern = /^\d{9}[VX]$/;
  const newNicPattern = /^\d{12}$/;

  return (
    oldNicPattern.test(normalizedNic) ||
    newNicPattern.test(normalizedNic)
  );
};

/* =========================================================
   HELPER - HASH OTP
========================================================= */

const hashOtp = (otp) => {
  return crypto
    .createHash("sha256")
    .update(String(otp))
    .digest("hex");
};

/* =========================================================
   SEND REGISTRATION OTP
========================================================= */

// @desc    Send citizen registration OTP to email
// @route   POST /api/auth/send-registration-otp
// @access  Public
const sendRegistrationOtp = async (
  req,
  res,
  next
) => {
  try {
    const email = normalizeEmail(
      req.body.email
    );

    /* ---------------------------------------------------------
       VALIDATE EMAIL
    --------------------------------------------------------- */

    if (!email) {
      return res.status(400).json({
        success: false,
        message:
          "Email address is required",
      });
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid email address",
      });
    }

    /* ---------------------------------------------------------
       CHECK EXISTING ACCOUNT
    --------------------------------------------------------- */

    const existingUser =
      await User.findOne({
        email,
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    /* ---------------------------------------------------------
       CHECK RESEND COOLDOWN
    --------------------------------------------------------- */

    const existingVerification =
      await RegistrationVerification.findOne({
        email,
      }).select(
        "+otpHash"
      );

    if (
      existingVerification &&
      existingVerification.lastOtpSentAt
    ) {
      const elapsedMilliseconds =
        Date.now() -
        new Date(
          existingVerification.lastOtpSentAt
        ).getTime();

      const elapsedSeconds =
        Math.floor(
          elapsedMilliseconds / 1000
        );

      if (
        elapsedSeconds <
        OTP_RESEND_COOLDOWN_SECONDS
      ) {
        const remainingSeconds =
          OTP_RESEND_COOLDOWN_SECONDS -
          elapsedSeconds;

        return res.status(429).json({
          success: false,
          message: `Please wait ${remainingSeconds} seconds before requesting another OTP.`,
          retryAfterSeconds:
            remainingSeconds,
        });
      }
    }

    /* ---------------------------------------------------------
       GENERATE SECURE 6-DIGIT OTP
    --------------------------------------------------------- */

    const otp =
      crypto
        .randomInt(
          100000,
          1000000
        )
        .toString();

    const otpHash =
      hashOtp(otp);

    const otpExpiresAt =
      new Date(
        Date.now() +
          OTP_EXPIRY_MINUTES *
            60 *
            1000
      );

    /* ---------------------------------------------------------
       CREATE / UPDATE VERIFICATION RECORD
    --------------------------------------------------------- */

    const verification =
      await RegistrationVerification.findOneAndUpdate(
        {
          email,
        },
        {
          email,
          otpHash,
          otpExpiresAt,

          isVerified: false,
          verifiedAt: null,

          attempts: 0,

          lastOtpSentAt:
            new Date(),
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

    /* ---------------------------------------------------------
       EMAIL TEMPLATE
    --------------------------------------------------------- */

    const emailSubject =
      "Verify Your Email - Public Complaint Management System";

    const emailText =
      `Your email verification OTP is ${otp}. ` +
      `This OTP will expire in ${OTP_EXPIRY_MINUTES} minutes.`;

    const emailHtml = `
      <div
        style="
          font-family: Arial, Helvetica, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          color: #16324A;
          border: 1px solid #D8E5EC;
          border-radius: 16px;
          overflow: hidden;
        "
      >
        <div
          style="
            background: #123B5D;
            padding: 24px;
            text-align: center;
          "
        >
          <h2
            style="
              margin: 0;
              color: #ffffff;
            "
          >
            Public Complaint Management System
          </h2>
        </div>

        <div
          style="
            padding: 32px;
          "
        >
          <h2
            style="
              margin-top: 0;
              color: #16324A;
            "
          >
            Verify Your Email Address
          </h2>

          <p
            style="
              color: #60798C;
              line-height: 1.7;
            "
          >
            Use the following verification code
            to verify your email address and
            continue creating your citizen account.
          </p>

          <div
            style="
              margin: 28px 0;
              padding: 20px;
              text-align: center;
              background: #E8F6F4;
              border-radius: 12px;
            "
          >
            <div
              style="
                font-size: 34px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #1B8A8F;
              "
            >
              ${otp}
            </div>
          </div>

          <p
            style="
              color: #60798C;
              line-height: 1.7;
            "
          >
            This OTP will expire in
            <strong>${OTP_EXPIRY_MINUTES} minutes</strong>.
          </p>

          <p
            style="
              color: #60798C;
              line-height: 1.7;
            "
          >
            If you did not request this verification
            code, you can safely ignore this email.
          </p>

          <hr
            style="
              border: 0;
              border-top: 1px solid #D8E5EC;
              margin: 28px 0;
            "
          />

          <p
            style="
              margin: 0;
              font-size: 12px;
              color: #8A9EAC;
            "
          >
            AI-Powered Multilingual Public Complaint
            Management System
          </p>
        </div>
      </div>
    `;

    /* ---------------------------------------------------------
       SEND OTP EMAIL
    --------------------------------------------------------- */

    try {
      await sendEmail({
        to: email,
        subject: emailSubject,
        text: emailText,
        html: emailHtml,
      });
    } catch (emailError) {
      console.error(
        "Registration OTP email error:",
        emailError
      );

      /*
       * Remove the OTP that could not be delivered.
       */
      await RegistrationVerification.deleteOne({
        _id: verification._id,
      });

      return res.status(500).json({
        success: false,
        message:
          "Unable to send verification OTP. Please try again.",
      });
    }

    /* ---------------------------------------------------------
       SUCCESS
    --------------------------------------------------------- */

    return res.status(200).json({
      success: true,
      message:
        "Verification OTP sent successfully. Please check your email.",
      expiresInMinutes:
        OTP_EXPIRY_MINUTES,
      resendAfterSeconds:
        OTP_RESEND_COOLDOWN_SECONDS,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   VERIFY REGISTRATION OTP
========================================================= */

// @desc    Verify citizen registration email OTP
// @route   POST /api/auth/verify-registration-otp
// @access  Public
const verifyRegistrationOtp = async (
  req,
  res,
  next
) => {
  try {
    const email = normalizeEmail(
      req.body.email
    );

    const otp = String(
      req.body.otp || ""
    ).trim();

    /* ---------------------------------------------------------
       VALIDATION
    --------------------------------------------------------- */

    if (!email) {
      return res.status(400).json({
        success: false,
        message:
          "Email address is required",
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid 6-digit OTP",
      });
    }

    /* ---------------------------------------------------------
       FIND VERIFICATION
    --------------------------------------------------------- */

    const verification =
      await RegistrationVerification.findOne({
        email,
      }).select(
        "+otpHash"
      );

    if (!verification) {
      return res.status(400).json({
        success: false,
        message:
          "No verification request was found for this email. Please request a new OTP.",
      });
    }

    /* ---------------------------------------------------------
       ALREADY VERIFIED
    --------------------------------------------------------- */

    if (verification.isVerified) {
      return res.status(200).json({
        success: true,
        message:
          "Email address is already verified.",
        verified: true,
      });
    }

    /* ---------------------------------------------------------
       CHECK EXPIRY
    --------------------------------------------------------- */

    if (
      !verification.otpExpiresAt ||
      verification.otpExpiresAt <
        new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Verification OTP has expired. Please request a new OTP.",
      });
    }

    /* ---------------------------------------------------------
       ATTEMPT LIMIT
    --------------------------------------------------------- */

    if (
      verification.attempts >=
      MAX_OTP_ATTEMPTS
    ) {
      return res.status(429).json({
        success: false,
        message:
          "Too many incorrect OTP attempts. Please request a new OTP.",
      });
    }

    /* ---------------------------------------------------------
       COMPARE OTP
    --------------------------------------------------------- */

    const submittedOtpHash =
      hashOtp(otp);

    const isOtpValid =
      submittedOtpHash ===
      verification.otpHash;

    if (!isOtpValid) {
      verification.attempts += 1;

      await verification.save({
        validateBeforeSave: false,
      });

      const remainingAttempts =
        Math.max(
          0,
          MAX_OTP_ATTEMPTS -
            verification.attempts
        );

      return res.status(400).json({
        success: false,
        message:
          remainingAttempts > 0
            ? `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`
            : "Invalid OTP. Please request a new OTP.",
        remainingAttempts,
      });
    }

    /* ---------------------------------------------------------
       OTP VERIFIED
    --------------------------------------------------------- */

    verification.isVerified =
      true;

    verification.verifiedAt =
      new Date();

    /*
     * OTP no longer needs to remain usable after verification.
     */
    verification.otpHash =
      hashOtp(
        crypto
          .randomBytes(32)
          .toString("hex")
      );

    verification.attempts =
      0;

    await verification.save({
      validateBeforeSave: false,
    });

    return res.status(200).json({
      success: true,
      verified: true,
      message:
        "Email verified successfully. You can now create your account.",
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   REGISTER USER
========================================================= */

// @desc    Register a new citizen after email verification
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (
  req,
  res,
  next
) => {
  try {
    let {
      fullName,
      nic,
      email,
      password,
      preferredLanguage,
    } = req.body;

    /* ---------------------------------------------------------
       NORMALIZE DATA
    --------------------------------------------------------- */

    fullName =
      String(fullName || "").trim();

    email =
      normalizeEmail(email);

    nic =
      normalizeNic(nic);

    /* ---------------------------------------------------------
       BASIC VALIDATION
    --------------------------------------------------------- */

    if (!fullName) {
      return res.status(400).json({
        success: false,
        message:
          "Full name is required",
      });
    }

    if (!nic) {
      return res.status(400).json({
        success: false,
        message:
          "NIC number is required",
      });
    }

    if (
      !isValidSriLankanNic(nic)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid Sri Lankan NIC number",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message:
          "Email address is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message:
          "Password is required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 8 characters",
      });
    }

    /* ---------------------------------------------------------
       CHECK EXISTING EMAIL
    --------------------------------------------------------- */

    const existingEmailUser =
      await User.findOne({
        email,
      });

    if (existingEmailUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    /* ---------------------------------------------------------
       CHECK EXISTING NIC
    --------------------------------------------------------- */

    const existingNicUser =
      await User.findOne({
        nic,
      });

    if (existingNicUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this NIC number already exists",
      });
    }

    /* ---------------------------------------------------------
       REQUIRE VERIFIED EMAIL
    --------------------------------------------------------- */

    const verification =
      await RegistrationVerification.findOne({
        email,
        isVerified: true,
      });

    if (!verification) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your email address before creating an account.",
      });
    }

    /* ---------------------------------------------------------
       OPTIONAL VERIFICATION AGE CHECK

       Prevent an old verification record being used indefinitely.
       Allow registration within 30 minutes of successful verification.
    --------------------------------------------------------- */

    if (
      !verification.verifiedAt ||
      Date.now() -
        new Date(
          verification.verifiedAt
        ).getTime() >
        30 * 60 * 1000
    ) {
      await RegistrationVerification.deleteOne({
        _id: verification._id,
      });

      return res.status(403).json({
        success: false,
        message:
          "Email verification has expired. Please verify your email again.",
      });
    }

    /* ---------------------------------------------------------
       HASH PASSWORD
    --------------------------------------------------------- */

    const salt =
      await bcrypt.genSalt(12);

    const hashedPassword =
      await bcrypt.hash(
        password,
        salt
      );

    /* ---------------------------------------------------------
       CREATE CITIZEN ACCOUNT
    --------------------------------------------------------- */

    const user =
      await User.create({
        fullName,
        nic,
        email,

        password:
          hashedPassword,

        role: "citizen",

        preferredLanguage:
          preferredLanguage ||
          "english",

        isEmailVerified: true,

        emailVerifiedAt:
          verification.verifiedAt ||
          new Date(),
      });

    /* ---------------------------------------------------------
       REMOVE USED VERIFICATION RECORD
    --------------------------------------------------------- */

    await RegistrationVerification.deleteOne({
      _id: verification._id,
    });

    /* ---------------------------------------------------------
       RESPONSE
    --------------------------------------------------------- */

    return res.status(201).json({
      success: true,
      message:
        "Registration successful",
      user: {
        id: user._id,

        fullName:
          user.fullName,

        nic:
          user.nic,

        email:
          user.email,

        role:
          user.role,

        preferredLanguage:
          user.preferredLanguage,

        isEmailVerified:
          user.isEmailVerified,
      },
    });
  } catch (error) {
    /* ---------------------------------------------------------
       HANDLE DUPLICATE MONGODB INDEX
    --------------------------------------------------------- */

    if (
      error?.code === 11000
    ) {
      if (
        error.keyPattern?.nic ||
        error.keyValue?.nic
      ) {
        return res.status(409).json({
          success: false,
          message:
            "An account with this NIC number already exists",
        });
      }

      if (
        error.keyPattern?.email ||
        error.keyValue?.email
      ) {
        return res.status(409).json({
          success: false,
          message:
            "An account with this email already exists",
        });
      }
    }

    next(error);
  }
};

/* =========================================================
   LOGIN USER
========================================================= */

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (
  req,
  res,
  next
) => {
  try {
    const email =
      normalizeEmail(
        req.body.email
      );

    const {
      password,
    } = req.body;

    /* ---------------------------------------------------------
       FIND USER
    --------------------------------------------------------- */

    const user =
      await User.findOne({
        email,
      }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    /* ---------------------------------------------------------
       ACCOUNT STATUS
    --------------------------------------------------------- */

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is inactive",
      });
    }

    /*
     * Email verification applies only to citizens.
     *
     * Explicit === false keeps existing legacy citizen
     * accounts that do not yet have this field working.
     */
    if (
      user.role === "citizen" &&
      user.isEmailVerified === false
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your email before signing in.",
      });
    }

    /* ---------------------------------------------------------
       PASSWORD
    --------------------------------------------------------- */

    const isPasswordValid =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    /* ---------------------------------------------------------
       JWT
    --------------------------------------------------------- */

    const token =
      generateToken(
        user._id,
        user.role
      );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,

        fullName:
          user.fullName,

        nic:
          user.role ===
          "citizen"
            ? user.nic
            : undefined,

        email:
          user.email,

        role:
          user.role,

        preferredLanguage:
          user.preferredLanguage,

        isEmailVerified:
          user.isEmailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET CURRENT USER
========================================================= */

// @desc    Get currently authenticated user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (
  req,
  res,
  next
) => {
  try {
    return res.status(200).json({
      success: true,
      user: {
        id:
          req.user._id,

        fullName:
          req.user.fullName,

        nic:
          req.user.role ===
          "citizen"
            ? req.user.nic
            : undefined,

        email:
          req.user.email,

        role:
          req.user.role,

        preferredLanguage:
          req.user
            .preferredLanguage,

        isEmailVerified:
          req.user
            .isEmailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   FORGOT PASSWORD
========================================================= */

// @desc    Generate password reset token
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (
  req,
  res,
  next
) => {
  try {
    const email =
      normalizeEmail(
        req.body.email
      );

    if (!email) {
      return res.status(400).json({
        success: false,
        message:
          "Email address is required",
      });
    }

    const user =
      await User.findOne({
        email,
      }).select(
        "+passwordResetToken +passwordResetExpires"
      );

    /*
     * Do not reveal whether an account exists.
     */

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists for this email, a password reset link will be generated.",
      });
    }

    if (!user.isActive) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists for this email, a password reset link will be generated.",
      });
    }

    /* ---------------------------------------------------------
       RESET TOKEN
    --------------------------------------------------------- */

    const resetToken =
      crypto
        .randomBytes(32)
        .toString("hex");

    const hashedResetToken =
      crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    user.passwordResetToken =
      hashedResetToken;

    user.passwordResetExpires =
      Date.now() +
      15 * 60 * 1000;

    await user.save({
      validateBeforeSave: false,
    });

    /* ---------------------------------------------------------
       DEVELOPMENT RESET URL
    --------------------------------------------------------- */

    const frontendUrl =
      process.env.FRONTEND_URL ||
      "http://localhost:5173";

    const resetUrl =
      `${frontendUrl}/reset-password/${resetToken}`;

    return res.status(200).json({
      success: true,
      message:
        "Password reset link generated successfully.",
      resetUrl,
      expiresInMinutes: 15,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   RESET PASSWORD
========================================================= */

// @desc    Reset password using reset token
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (
  req,
  res,
  next
) => {
  try {
    const {
      token,
    } = req.params;

    const {
      password,
      confirmPassword,
    } = req.body;

    /* ---------------------------------------------------------
       VALIDATION
    --------------------------------------------------------- */

    if (!token) {
      return res.status(400).json({
        success: false,
        message:
          "Password reset token is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message:
          "New password is required",
      });
    }

    if (
      password.length < 8
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 8 characters",
      });
    }

    if (
      confirmPassword !==
        undefined &&
      password !==
        confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Passwords do not match",
      });
    }

    /* ---------------------------------------------------------
       HASH RECEIVED TOKEN
    --------------------------------------------------------- */

    const hashedResetToken =
      crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    /* ---------------------------------------------------------
       FIND VALID USER
    --------------------------------------------------------- */

    const user =
      await User.findOne({
        passwordResetToken:
          hashedResetToken,

        passwordResetExpires: {
          $gt: Date.now(),
        },
      }).select(
        "+password +passwordResetToken +passwordResetExpires"
      );

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "Password reset token is invalid or has expired",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is inactive",
      });
    }

    /* ---------------------------------------------------------
       HASH NEW PASSWORD
    --------------------------------------------------------- */

    const salt =
      await bcrypt.genSalt(12);

    user.password =
      await bcrypt.hash(
        password,
        salt
      );

    /* ---------------------------------------------------------
       INVALIDATE TOKEN
    --------------------------------------------------------- */

    user.passwordResetToken =
      null;

    user.passwordResetExpires =
      null;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. You can now sign in with your new password.",
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  sendRegistrationOtp,
  verifyRegistrationOtp,

  registerUser,
  loginUser,
  getMe,

  forgotPassword,
  resetPassword,
};