import axios from "axios";

// =========================================================
// API BASE URL
// =========================================================

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// =========================================================
// GET MY NOTIFICATIONS
// GET /api/notifications
// =========================================================

export const getMyNotifications = async (token) => {
  try {
    const response = await axios.get(
      `${API_URL}/notifications`,
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
        message: "Unable to load notifications.",
      }
    );
  }
};

// =========================================================
// GET UNREAD NOTIFICATION COUNT
// GET /api/notifications/unread-count
// =========================================================

export const getUnreadNotificationCount = async (token) => {
  try {
    const response = await axios.get(
      `${API_URL}/notifications/unread-count`,
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
        message: "Unable to load unread notification count.",
      }
    );
  }
};

// =========================================================
// MARK ONE NOTIFICATION AS READ
// PATCH /api/notifications/:id/read
// =========================================================

export const markNotificationAsRead = async (
  notificationId,
  token
) => {
  try {
    const response = await axios.patch(
      `${API_URL}/notifications/${notificationId}/read`,
      {},
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
        message: "Unable to mark notification as read.",
      }
    );
  }
};

// =========================================================
// MARK ALL NOTIFICATIONS AS READ
// PATCH /api/notifications/read-all
// =========================================================

export const markAllNotificationsAsRead = async (token) => {
  try {
    const response = await axios.patch(
      `${API_URL}/notifications/read-all`,
      {},
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
        message: "Unable to mark all notifications as read.",
      }
    );
  }
};

// =========================================================
// DELETE NOTIFICATION
// DELETE /api/notifications/:id
// =========================================================

export const deleteNotification = async (
  notificationId,
  token
) => {
  try {
    const response = await axios.delete(
      `${API_URL}/notifications/${notificationId}`,
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
        message: "Unable to delete notification.",
      }
    );
  }
};