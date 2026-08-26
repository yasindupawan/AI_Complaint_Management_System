import axios from "axios";

/* =========================================================
   API BASE URL
========================================================= */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

/* =========================================================
   REGISTER USER
   POST /api/auth/register
========================================================= */

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/register`,
      userData
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to connect to the server.",
      }
    );
  }
};

/* =========================================================
   LOGIN USER
   POST /api/auth/login
========================================================= */

export const loginUser = async (loginData) => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/login`,
      loginData
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to connect to the server.",
      }
    );
  }
};

/* =========================================================
   FORGOT PASSWORD
   POST /api/auth/forgot-password
========================================================= */

export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/forgot-password`,
      {
        email:
          typeof email === "string"
            ? email.trim().toLowerCase()
            : email,
      }
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message:
          "Unable to process the password reset request.",
      }
    );
  }
};

/* =========================================================
   RESET PASSWORD
   POST /api/auth/reset-password/:token
========================================================= */

export const resetPassword = async (
  token,
  passwordData
) => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/reset-password/${token}`,
      passwordData
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message:
          "Unable to reset your password.",
      }
    );
  }
};

/* =========================================================
   GET CURRENT LOGGED-IN USER
   GET /api/auth/me
========================================================= */

export const getCurrentUser = async (token) => {
  try {
    const response = await axios.get(
      `${API_URL}/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message:
          "Unable to get user information.",
      }
    );
  }
};