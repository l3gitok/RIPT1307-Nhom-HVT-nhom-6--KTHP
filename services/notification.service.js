const mongoose = require('mongoose');
const { Notification, NOTIFICATION_TYPES } = require('../models/notification.model');

// ✅ Create notification
exports.createNotification = async ({ recipient, sender, type, title, message, data = {} }) => {
  if (!Object.values(NOTIFICATION_TYPES).includes(type)) {
    const error = new Error(`Invalid notification type: ${type}`);
    error.status = 400; // Thêm status code cho HTTP response
    throw error;
  }

  const notificationData = {
    user_id: recipient, // Ánh xạ recipient sang user_id
    type,
    title,
    message,
    payload: data // Ánh xạ data sang payload
  };

  // Ép kiểu tường minh các ID và xử lý sender có thể null
  try {
    if (!recipient) {
      throw new Error('Recipient is required for notification.');
    }
    notificationData.user_id = new mongoose.Types.ObjectId(recipient); // Sử dụng recipient từ tham số

    if (sender) {
      notificationData.sender = new mongoose.Types.ObjectId(sender);
    } else {
      notificationData.sender = null; // Schema cho phép sender là null (required: false)
    }
  } catch (castError) {
    console.error('[NotificationService] Error casting ObjectId:', castError.message);
    const error = new Error(`Invalid ID format for recipient or sender: ${castError.message}`);
    error.status = 400;
    throw error;
  }

  // Log dữ liệu trước khi tạo
  console.log('[NotificationService] Attempting to create notification with data:', JSON.stringify(notificationData, null, 2));

  try {
    // Sử dụng new Model() và doc.save() để có thể bắt lỗi Mongoose chi tiết hơn
    const notificationDoc = new Notification(notificationData);
    await notificationDoc.validate(); // Gọi validate tường minh
    const newNotification = await notificationDoc.save(); // Sau đó lưu

    console.log('[NotificationService] Notification created successfully:', newNotification._id);
    return newNotification;
  } catch (error) {
    console.error('[NotificationService] Error creating notification in service:', error.message);
    // Kiểm tra xem có phải là Mongoose ValidationError không
    if (error.name === 'ValidationError' && error.errors) {
      console.error('[NotificationService] Mongoose Validation errors:', JSON.stringify(error.errors, null, 2));
    } else {
      console.error('[NotificationService] Other error details (could be MongoServerError):', error);
    }
    throw error; // Ném lại lỗi để controller xử lý
  }
};

// ✅ Get notifications for user với proper field names
exports.getNotificationsForUser = async (userId) => {
  return await Notification.find({ user_id: userId }) // Sử dụng user_id
    .populate('sender', 'email profile')
    .sort({ created_at: -1 });
};

// ✅ Mark as read
exports.markAsRead = async (notificationId) => {
  return await Notification.findByIdAndUpdate(
    notificationId, 
    { read: true }, // Sử dụng read
    { new: true }
  );
};

// ✅ Delete notification
exports.deleteNotification = async (notificationId) => {
  return await Notification.findByIdAndDelete(notificationId);
};

// ✅ Delete all notifications for user
exports.deleteAllNotificationsForUser = async (userId) => {
  return await Notification.deleteMany({ user_id: userId }); // Sử dụng user_id
};

// ✅ Mark all as read
exports.markAllAsRead = async (userId) => {
  return await Notification.updateMany(
    { user_id: userId, read: false }, // Sử dụng user_id và read
    { read: true } // Sử dụng read
  );
};

// ✅ Get unread count
exports.getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ 
    user_id: userId, // Sử dụng user_id
    read: false // Sử dụng read
  });
};

// ✅ Get paginated notifications
exports.getPaginatedNotifications = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return await Notification.find({ user_id: userId }) // Sử dụng user_id
    .populate('sender', 'email profile')
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit);
};
