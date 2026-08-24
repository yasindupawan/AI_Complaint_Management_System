import axios from "axios";

/* =========================================================
   API BASE URL
========================================================= */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

/* =========================================================
   GET ALL COMPLAINTS - ADMIN
   GET /api/complaints/admin/all
========================================================= */

export const getAllAdminComplaints = async (token) => {
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
        message:
          "Unable to load admin complaints.",
      }
    );
  }
};

/* =========================================================
   GET SINGLE COMPLAINT - ADMIN
   GET /api/complaints/admin/:id
========================================================= */

export const getAdminComplaintById = async (
  complaintId,
  token
) => {
  try {
    const response = await axios.get(
      `${API_URL}/complaints/admin/${complaintId}`,
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
          "Unable to load complaint details.",
      }
    );
  }
};

/* =========================================================
   GET COMPLAINT HISTORY - ADMIN
   GET /api/complaints/admin/:id/history
========================================================= */

export const getAdminComplaintHistory = async (
  complaintId,
  token
) => {
  try {
    const response = await axios.get(
      `${API_URL}/complaints/admin/${complaintId}/history`,
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
          "Unable to load complaint history.",
      }
    );
  }
};

/* =========================================================
   UPDATE COMPLAINT STATUS - ADMIN
   PATCH /api/complaints/admin/:id/status
========================================================= */

export const updateAdminComplaintStatus = async (
  complaintId,
  statusData,
  token
) => {
  try {
    const response = await axios.patch(
      `${API_URL}/complaints/admin/${complaintId}/status`,
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
        message:
          "Unable to update complaint status.",
      }
    );
  }
};

/* =========================================================
   ASSIGN COMPLAINT - ADMIN
   PATCH /api/complaints/admin/:id/assign
========================================================= */

export const assignAdminComplaint = async (
  complaintId,
  assignmentData,
  token
) => {
  try {
    const response = await axios.patch(
      `${API_URL}/complaints/admin/${complaintId}/assign`,
      assignmentData,
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
          "Unable to assign complaint.",
      }
    );
  }
};

/* =========================================================
   CONFIRM DUPLICATE - ADMIN
   PATCH /api/complaints/admin/:id/confirm-duplicate
========================================================= */

export const confirmAdminDuplicate = async (
  complaintId,
  remarks,
  token
) => {
  try {
    const response = await axios.patch(
      `${API_URL}/complaints/admin/${complaintId}/confirm-duplicate`,
      {
        remarks,
      },
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
          "Unable to confirm duplicate complaint.",
      }
    );
  }
};

/* =========================================================
   REJECT DUPLICATE FLAG - ADMIN
   PATCH /api/complaints/admin/:id/reject-duplicate
========================================================= */

export const rejectAdminDuplicateFlag = async (
  complaintId,
  remarks,
  token
) => {
  try {
    const response = await axios.patch(
      `${API_URL}/complaints/admin/${complaintId}/reject-duplicate`,
      {
        remarks,
      },
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
          "Unable to reject duplicate flag.",
      }
    );
  }
};