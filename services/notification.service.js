const { Notification, NOTIFICATION_TYPES } = require('../models/notification.model');

exports.createNotification = async ({ user_id, type, payload }) => {
  if (!Object.values(NOTIFICATION_TYPES).includes(type)) {
    throw new Error('Invalid notification type');
  }
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

exports.deleteNotification = async (notificationId) => {
  return await Notification.findByIdAndDelete(notificationId);
};

exports.deleteAllNotificationsForUser = async (userId) => {
  return await Notification.deleteMany({ user_id: userId });
};

exports.markAllAsRead = async (userId) => {
  return await Notification.updateMany(
    { user_id: userId, read: false },
    { read: true }
  );
};

exports.getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ 
    user_id: userId, 
    read: false 
  });
};

exports.getPaginatedNotifications = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return await Notification.find({ user_id: userId })
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit);
};
