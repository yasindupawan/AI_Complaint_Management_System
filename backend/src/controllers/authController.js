const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const User = require("../models/User");
const generateToken = require("../utils/generateToken");

/* =========================================================
   REGISTER USER
========================================================= */

// @desc    Register a new citizen
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      password,
      preferredLanguage,
    } = req.body;

    // Check whether the email is already registered
    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(12);

    const hashedPassword = await bcrypt.hash(
      password,
      salt
    );

    // Public registration always creates a citizen account
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: "citizen",
      preferredLanguage:
        preferredLanguage || "english",
    });

    // Send safe user information only
    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        preferredLanguage:
          user.preferredLanguage,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   LOGIN USER
========================================================= */

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // Find user and explicitly include password
    const user = await User.findOne({
      email,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // Check whether the account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is inactive",
      });
    }

    // Compare entered password with hashed password
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

    // Generate JWT
    const token = generateToken(
      user._id,
      user.role
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        preferredLanguage:
          user.preferredLanguage,
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
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        role: req.user.role,
        preferredLanguage:
          req.user.preferredLanguage,
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
    const email = req.body.email
      ?.trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message:
          "Email address is required",
      });
    }

    const user = await User.findOne({
      email,
    }).select(
      "+passwordResetToken +passwordResetExpires"
    );

    /*
     * For security, do not reveal whether
     * the email exists in the system.
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

    // Generate secure random reset token
    const resetToken =
      crypto.randomBytes(32).toString(
        "hex"
      );

    // Hash token before storing in database
    const hashedResetToken =
      crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // Save hashed token
    user.passwordResetToken =
      hashedResetToken;

    // Token valid for 15 minutes
    user.passwordResetExpires =
      Date.now() +
      15 * 60 * 1000;

    await user.save({
      validateBeforeSave: false,
    });

    /*
     * Development reset URL.
     *
     * Later we will replace this with
     * an email containing this URL.
     */
    const frontendUrl =
      process.env.FRONTEND_URL ||
      "http://localhost:5173";

    const resetUrl =
      `${frontendUrl}/reset-password/${resetToken}`;

    /*
     * IMPORTANT:
     * For development we return resetUrl
     * so we can test the entire flow.
     *
     * Once email sending is implemented,
     * this should not be returned in
     * production.
     */
    res.status(200).json({
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

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 8 characters",
      });
    }

    if (
      confirmPassword !== undefined &&
      password !== confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Passwords do not match",
      });
    }

    // Hash incoming token so it can be
    // compared to the stored hashed token
    const hashedResetToken =
      crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    // Find user with matching, non-expired token
    const user = await User.findOne({
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

    // Hash new password
    const salt = await bcrypt.genSalt(
      12
    );

    user.password =
      await bcrypt.hash(
        password,
        salt
      );

    // Reset token can no longer be used
    user.passwordResetToken =
      null;

    user.passwordResetExpires =
      null;

    await user.save();

    res.status(200).json({
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
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
};