const Notification = require("../models/Notification");

// @GET /api/notifications — get all notifications for current user
const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort("-createdAt")
    .limit(30);

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    read: false,
  });

  res.status(200).json({ unreadCount, count: notifications.length, notifications });
};

// @PATCH /api/notifications/:id/read — mark single notification as read
const markAsRead = async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.status(200).json({ message: "Marked as read" });
};

// @PATCH /api/notifications/read-all — mark all as read
const markAllAsRead = async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, read: false },
    { read: true }
  );
  res.status(200).json({ message: "All notifications marked as read" });
};

// @DELETE /api/notifications/:id — delete a notification
const deleteNotification = async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Notification deleted" });
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};