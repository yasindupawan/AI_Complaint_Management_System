import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

// =========================================================
// GET LOGGED-IN CITIZEN COMPLAINTS
// =========================================================

export const getMyComplaints = async (token) => {
  try {
    const response = await axios.get(
      `${API_URL}/complaints/my`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Get my complaints error:",
      error.response?.data || error.message
    );

    throw (
      error.response?.data || {
        success: false,
        message: "Unable to load complaints.",
      }
    );
  }
};