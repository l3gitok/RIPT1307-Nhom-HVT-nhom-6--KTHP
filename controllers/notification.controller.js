const notificationService = require('../services/notification.service');
const { NOTIFICATION_TYPES } = require('../models/notification.model');

// ✅ Lấy danh sách thông báo của user
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user._id || req.user.id;
    
    const notifications = await notificationService.getPaginatedNotifications(
      userId,
      parseInt(page),
      parseInt(limit)
    );
    const unreadCount = await notificationService.getUnreadCount(userId);
    
    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        currentPage: parseInt(page),
        totalPages: Math.ceil(unreadCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách thông báo',
      error: error.message
    });
  }
};

// ✅ Đánh dấu một thông báo đã đọc
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await notificationService.markAsRead(notificationId);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông báo'
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đánh dấu thông báo đã đọc',
      error: error.message
    });
  }
};

// ✅ Đánh dấu tất cả thông báo đã đọc
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    await notificationService.markAllAsRead(userId);
    
    res.json({
      success: true,
      message: 'Đã đánh dấu tất cả thông báo đã đọc'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đánh dấu tất cả thông báo đã đọc',
      error: error.message
    });
  }
};

// ✅ Xóa một thông báo
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await notificationService.deleteNotification(notificationId);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông báo'
      });
    }

    res.json({
      success: true,
      message: 'Đã xóa thông báo thành công'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa thông báo',
      error: error.message
    });
  }
};

// ✅ Xóa tất cả thông báo
exports.deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    await notificationService.deleteAllNotificationsForUser(userId);
    
    res.json({
      success: true,
      message: 'Đã xóa tất cả thông báo thành công'
    });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa tất cả thông báo',
      error: error.message
    });
  }
};

// ✅ Lấy số lượng thông báo chưa đọc
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const count = await notificationService.getUnreadCount(userId);
    
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy số lượng thông báo chưa đọc',
      error: error.message
    });
  }
};
