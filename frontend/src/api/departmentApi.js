import axios from "axios";

/* =========================================================
   API BASE URL
========================================================= */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

/* =========================================================
   AUTH CONFIG HELPER
========================================================= */

const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

/* =========================================================
   GET ALL DEPARTMENTS
   GET /api/departments
========================================================= */

export const getDepartments = async (
  token
) => {
  try {
    const response = await axios.get(
      `${API_URL}/departments`,
      getAuthConfig(token)
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message:
          "Unable to load departments.",
      }
    );
  }
};

/* =========================================================
   GET OFFICERS BY DEPARTMENT
   GET /api/departments/:id/officers
========================================================= */

export const getOfficersByDepartment =
  async (
    departmentId,
    token
  ) => {
    try {
      const response =
        await axios.get(
          `${API_URL}/departments/${departmentId}/officers`,
          getAuthConfig(token)
        );

      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          success: false,
          message:
            "Unable to load department officers.",
        }
      );
    }
  };

/* =========================================================
   CREATE DEPARTMENT - ADMIN
   POST /api/departments
========================================================= */

export const createDepartment = async (
  departmentData,
  token
) => {
  try {
    const response = await axios.post(
      `${API_URL}/departments`,
      departmentData,
      getAuthConfig(token)
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message:
          "Unable to create department.",
      }
    );
  }
};

/* =========================================================
   UPDATE DEPARTMENT - ADMIN
   PATCH /api/departments/:id
========================================================= */

export const updateDepartment = async (
  departmentId,
  departmentData,
  token
) => {
  try {
    const response = await axios.patch(
      `${API_URL}/departments/${departmentId}`,
      departmentData,
      getAuthConfig(token)
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message:
          "Unable to update department.",
      }
    );
  }
};

/* =========================================================
   UPDATE DEPARTMENT STATUS - ADMIN
   PATCH /api/departments/:id/status
========================================================= */

export const updateDepartmentStatus =
  async (
    departmentId,
    isActive,
    token
  ) => {
    try {
      const response =
        await axios.patch(
          `${API_URL}/departments/${departmentId}/status`,
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
            "Unable to update department status.",
        }
      );
    }
  };

/* =========================================================
   DELETE DEPARTMENT - ADMIN
   DELETE /api/departments/:id
========================================================= */

export const deleteDepartment = async (
  departmentId,
  token
) => {
  try {
    const response = await axios.delete(
      `${API_URL}/departments/${departmentId}`,
      getAuthConfig(token)
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message:
          "Unable to delete department.",
      }
    );
  }
};