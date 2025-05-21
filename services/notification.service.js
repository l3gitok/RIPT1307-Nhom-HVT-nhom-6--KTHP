const Notification = require('../models/notification.model');

exports.createNotification = async ({ user_id, type, payload }) => {
  return await Notification.create({
    user_id,
    type,
    payload
  });
};

exports.getNotificationsForUser = async (userId) => {
  return await Notification.find({ user_id: userId }).sort({ created_at: -1 });
};

exports.markAsRead = async (notificationId) => {
  return await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
};
