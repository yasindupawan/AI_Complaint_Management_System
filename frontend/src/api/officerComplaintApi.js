import axios from "axios";

/* =========================================================
   API BASE URL
========================================================= */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

/* =========================================================
   GET ASSIGNED COMPLAINTS - OFFICER
   GET /api/complaints/officer/assigned
========================================================= */

export const getOfficerAssignedComplaints = async (token) => {
  try {
    const response = await axios.get(
      `${API_URL}/complaints/officer/assigned`,
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
        message: "Unable to load assigned complaints.",
      }
    );
  }
};

/* =========================================================
   GET SINGLE ASSIGNED COMPLAINT - OFFICER
   GET /api/complaints/officer/:id
========================================================= */

export const getOfficerComplaintById = async (
  complaintId,
  token
) => {
  try {
    const response = await axios.get(
      `${API_URL}/complaints/officer/${complaintId}`,
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
        message: "Unable to load complaint details.",
      }
    );
  }
};

/* =========================================================
   UPDATE ASSIGNED COMPLAINT STATUS - OFFICER
   PATCH /api/complaints/officer/:id/status
========================================================= */

export const updateOfficerComplaintStatus = async (
  complaintId,
  statusData,
  token
) => {
  try {
    const response = await axios.patch(
      `${API_URL}/complaints/officer/${complaintId}/status`,
      statusData,
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
        message: "Unable to update complaint status.",
      }
    );
  }
};