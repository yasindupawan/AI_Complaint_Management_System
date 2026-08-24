import axios from "axios";

/* =========================================================
   API BASE URL
========================================================= */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

/* =========================================================
   GET LOGGED-IN CITIZEN'S COMPLAINTS
   GET /api/complaints/my
========================================================= */

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
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to load complaints.",
      }
    );
  }
};

/* =========================================================
   CREATE NEW COMPLAINT
   POST /api/complaints
========================================================= */

export const createComplaint = async (
  complaintData,
  token
) => {
  try {
    const response = await axios.post(
      `${API_URL}/complaints`,
      complaintData,
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
        message: "Unable to submit complaint.",
      }
    );
  }
};

/* =========================================================
   GET SINGLE COMPLAINT
   GET /api/complaints/:id
========================================================= */

export const getComplaintById = async (
  complaintId,
  token
) => {
  try {
    const response = await axios.get(
      `${API_URL}/complaints/${complaintId}`,
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
        message: "Unable to load complaint.",
      }
    );
  }
};

/* =========================================================
   GET COMPLAINT STATUS HISTORY
   GET /api/complaints/:id/history
========================================================= */

export const getComplaintHistory = async (
  complaintId,
  token
) => {
  try {
    const response = await axios.get(
      `${API_URL}/complaints/${complaintId}/history`,
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
        message: "Unable to load complaint history.",
      }
    );
  }
};

/* =========================================================
   ADMIN - GET ALL COMPLAINTS
   GET /api/complaints/admin/all
========================================================= */

export const getAllComplaints = async (token) => {
  try {
    const response = await axios.get(
      `${API_URL}/complaints/admin/all`,
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
        message: "Unable to load all complaints.",
      }
    );
  }
};