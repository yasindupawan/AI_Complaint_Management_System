const Notification = require("../models/Notification");

// =========================================================
// GET MY NOTIFICATIONS
// =========================================================

// @desc    Get notifications for logged-in user
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
    })
      .populate(
        "complaint",
        "title status category priority"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET UNREAD COUNT
// =========================================================

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadNotificationCount = async (
  req,
  res,
  next
) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// MARK ONE NOTIFICATION AS READ
// =========================================================

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markNotificationAsRead = async (
  req,
  res,
  next
) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();

      await notification.save();
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// MARK ALL NOTIFICATIONS AS READ
// =========================================================

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllNotificationsAsRead = async (
  req,
  res,
  next
) => {
  try {
    const readAt = new Date();

    const result = await Notification.updateMany(
      {
        recipient: req.user._id,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// DELETE ONE NOTIFICATION
// =========================================================

// @desc    Delete a notification owned by logged-in user
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (
  req,
  res,
  next
) => {
  try {
    const notification =
      await Notification.findOneAndDelete({
        _id: req.params.id,
        recipient: req.user._id,
      });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};