const Notification = require('../models/notification.model');
const { NOTIFICATION_TYPES } = require('../models/notification.model');

// ✅ Create notification
exports.createNotification = async ({ recipient, sender, type, title, message, data = {} }) => {
  if (!Object.values(NOTIFICATION_TYPES).includes(type)) {
    throw new Error('Invalid notification type');
  }
  
  return await Notification.create({
    recipient,
    sender,
    type,
    title,
    message,
    data
  });
};

// ✅ Get notifications for user với proper field names
exports.getNotificationsForUser = async (userId) => {
  return await Notification.find({ recipient: userId })
    .populate('sender', 'email profile')
    .sort({ created_at: -1 });
};

// ✅ Mark as read
exports.markAsRead = async (notificationId) => {
  return await Notification.findByIdAndUpdate(
    notificationId, 
    { is_read: true }, 
    { new: true }
  );
};

// ✅ Delete notification
exports.deleteNotification = async (notificationId) => {
  return await Notification.findByIdAndDelete(notificationId);
};

// ✅ Delete all notifications for user
exports.deleteAllNotificationsForUser = async (userId) => {
  return await Notification.deleteMany({ recipient: userId });
};

// ✅ Mark all as read
exports.markAllAsRead = async (userId) => {
  return await Notification.updateMany(
    { recipient: userId, is_read: false },
    { is_read: true }
  );
};

// ✅ Get unread count
exports.getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ 
    recipient: userId, 
    is_read: false 
  });
};

// ✅ Get paginated notifications
exports.getPaginatedNotifications = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return await Notification.find({ recipient: userId })
    .populate('sender', 'email profile')
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit);
};
