import axios from "axios";

// =========================================================
// API CONFIGURATION
// =========================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

// =========================================================
// AUTH HEADER HELPER
// =========================================================

const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// =========================================================
// ADMIN - GET ALL USERS
// GET /api/users
// =========================================================

export const getAllUsers = async (
  token,
  filters = {}
) => {
  try {
    const params = {};

    if (filters.role) {
      params.role = filters.role;
    }

    if (filters.status) {
      params.status = filters.status;
    }

    if (filters.department) {
      params.department = filters.department;
    }

    if (filters.search?.trim()) {
      params.search =
        filters.search.trim();
    }

    const response =
      await axios.get(
        `${API_URL}/users`,
        {
          ...getAuthConfig(token),
          params,
        }
      );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message:
          "Unable to load users.",
      }
    );
  }
};

// =========================================================
// ADMIN - GET SINGLE USER
// GET /api/users/:id
// =========================================================

export const getUserById = async (
  userId,
  token
) => {
  try {
    const response =
      await axios.get(
        `${API_URL}/users/${userId}`,
        getAuthConfig(token)
      );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message:
          "Unable to load user details.",
      }
    );
  }
};

// =========================================================
// ADMIN - CREATE OFFICER
// POST /api/users/officers
// =========================================================

export const createOfficer = async (
  officerData,
  token
) => {
  try {
    const response =
      await axios.post(
        `${API_URL}/users/officers`,
        officerData,
        getAuthConfig(token)
      );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message:
          "Unable to create officer account.",
      }
    );
  }
};

// =========================================================
// ADMIN - UPDATE USER ACTIVE STATUS
// PATCH /api/users/:id/status
// =========================================================

export const updateUserStatus = async (
  userId,
  isActive,
  token
) => {
  try {
    const response =
      await axios.patch(
        `${API_URL}/users/${userId}/status`,
        {
          isActive,
        },
        getAuthConfig(token)
      );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message:
          "Unable to update user status.",
      }
    );
  }
};

// =========================================================
// ADMIN - UPDATE OFFICER DEPARTMENT
// PATCH /api/users/:id/department
// =========================================================

export const updateOfficerDepartment =
  async (
    userId,
    departmentId,
    token
  ) => {
    try {
      const response =
        await axios.patch(
          `${API_URL}/users/${userId}/department`,
          {
            department:
              departmentId,
          },
          getAuthConfig(token)
        );

      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message:
            "Unable to update officer department.",
        }
      );
    }
  };

// =========================================================
// ADMIN - GET USER STATISTICS
// GET /api/users/admin/statistics
// =========================================================

export const getUserStatistics = async (
  token
) => {
  try {
    const response =
      await axios.get(
        `${API_URL}/users/admin/statistics`,
        getAuthConfig(token)
      );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message:
          "Unable to load user statistics.",
      }
    );
  }
};

// =========================================================
// ADMIN - DELETE USER
// DELETE /api/users/:id
// =========================================================

export const deleteUser = async (
  userId,
  token
) => {
  try {
    const response =
      await axios.delete(
        `${API_URL}/users/${userId}`,
        getAuthConfig(token)
      );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message:
          "Unable to remove user account.",
      }
    );
  }
};