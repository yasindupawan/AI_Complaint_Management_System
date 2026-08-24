const Notification = require("../models/Notification");

// =========================================================
// CREATE NOTIFICATION
// =========================================================

const createNotification = async ({
  recipient,
  complaint,
  type,
  title,
  message,
}) => {
  try {
    if (!recipient) {
      throw new Error(
        "Notification recipient is required"
      );
    }

    if (!complaint) {
      throw new Error(
        "Complaint reference is required"
      );
    }

    if (!type || !title || !message) {
      throw new Error(
        "Notification type, title and message are required"
      );
    }

    const notification =
      await Notification.create({
        recipient,
        complaint,
        type,
        title,
        message,
      });

    return notification;
  } catch (error) {
    console.error(
      "Notification creation failed:",
      error.message
    );

    throw error;
  }
};

// =========================================================
// COMPLAINT SUBMITTED
// =========================================================

const notifyComplaintSubmitted = async (
  complaint
) => {
  return createNotification({
    recipient:
      complaint.citizen,

    complaint:
      complaint._id,

    type:
      "complaint_submitted",

    title:
      "Complaint Submitted",

    message:
      "Your complaint has been submitted successfully and is now awaiting processing.",
  });
};

// =========================================================
// COMPLAINT ASSIGNED
// =========================================================

const notifyComplaintAssigned = async (
  complaint
) => {
  return createNotification({
    recipient:
      complaint.citizen,

    complaint:
      complaint._id,

    type:
      "complaint_assigned",

    title:
      "Complaint Assigned",

    message:
      "Your complaint has been assigned to the relevant department and officer.",
  });
};

// =========================================================
// COMPLAINT IN PROGRESS
// =========================================================

const notifyComplaintInProgress = async (
  complaint
) => {
  return createNotification({
    recipient:
      complaint.citizen,

    complaint:
      complaint._id,

    type:
      "complaint_in_progress",

    title:
      "Complaint In Progress",

    message:
      "Your complaint is now being investigated by the assigned officer.",
  });
};

// =========================================================
// COMPLAINT RESOLVED
// =========================================================

const notifyComplaintResolved = async (
  complaint
) => {
  return createNotification({
    recipient:
      complaint.citizen,

    complaint:
      complaint._id,

    type:
      "complaint_resolved",

    title:
      "Complaint Resolved",

    message:
      "Your complaint has been marked as resolved.",
  });
};

// =========================================================
// COMPLAINT REJECTED
// =========================================================

const notifyComplaintRejected = async (
  complaint
) => {
  return createNotification({
    recipient:
      complaint.citizen,

    complaint:
      complaint._id,

    type:
      "complaint_rejected",

    title:
      "Complaint Rejected",

    message:
      "Your complaint has been reviewed and marked as rejected.",
  });
};

// =========================================================
// COMPLAINT CONFIRMED AS DUPLICATE
// =========================================================

const notifyComplaintDuplicate = async (
  complaint
) => {
  return createNotification({
    recipient:
      complaint.citizen,

    complaint:
      complaint._id,

    type:
      "complaint_duplicate",

    title:
      "Complaint Marked as Duplicate",

    message:
      "Your complaint was reviewed and confirmed as a duplicate of an existing complaint.",
  });
};

// =========================================================
// DUPLICATE FLAG REJECTED
// =========================================================

const notifyDuplicateReviewed = async (
  complaint
) => {
  return createNotification({
    recipient:
      complaint.citizen,

    complaint:
      complaint._id,

    type:
      "duplicate_reviewed",

    title:
      "Duplicate Review Completed",

    message:
      "Your complaint was reviewed and will continue through the normal complaint handling process.",
  });
};

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  createNotification,
  notifyComplaintSubmitted,
  notifyComplaintAssigned,
  notifyComplaintInProgress,
  notifyComplaintResolved,
  notifyComplaintRejected,
  notifyComplaintDuplicate,
  notifyDuplicateReviewed,
};