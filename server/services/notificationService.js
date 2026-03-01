const Notification = require("../models/Notification");

const createNotification = async (recipient, type, message, link = "") => {
  try {
    const notification = await Notification.create({
      recipient,
      type,
      message,
      link,
    });
    return notification;
  } catch (err) {
    console.error("Notification error:", err);
  }
};

module.exports = { createNotification };