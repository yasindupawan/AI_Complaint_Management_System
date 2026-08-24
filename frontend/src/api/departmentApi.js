import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export const getDepartments = async (
  token
) => {
  try {
    const response = await axios.get(
      `${API_URL}/departments`,
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
          "Unable to load departments.",
      }
    );
  }
};

export const getOfficersByDepartment =
  async (departmentId, token) => {
    try {
      const response = await axios.get(
        `${API_URL}/departments/${departmentId}/officers`,
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
            "Unable to load department officers.",
        }
      );
    }
  };