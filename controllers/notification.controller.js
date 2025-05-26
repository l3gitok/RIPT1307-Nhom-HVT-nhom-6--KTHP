const notificationService = require('../services/notification.service');
const { NOTIFICATION_TYPES } = require('../models/notification.model');

// Lấy danh sách thông báo của user
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const notifications = await notificationService.getPaginatedNotifications(
      req.user._id,
      parseInt(page),
      parseInt(limit)
    );
    const unreadCount = await notificationService.getUnreadCount(req.user._id);
    
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
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách thông báo',
      error: error.message
    });
  }
};

// Đánh dấu một thông báo đã đọc
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
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đánh dấu thông báo đã đọc',
      error: error.message
    });
  }
};

// Đánh dấu tất cả thông báo đã đọc
exports.markAllAsRead = async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user._id);
    res.json({
      success: true,
      message: 'Đã đánh dấu tất cả thông báo đã đọc'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đánh dấu tất cả thông báo đã đọc',
      error: error.message
    });
  }
};

// Xóa một thông báo
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
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa thông báo',
      error: error.message
    });
  }
};

// Xóa tất cả thông báo
exports.deleteAllNotifications = async (req, res) => {
  try {
    await notificationService.deleteAllNotificationsForUser(req.user._id);
    res.json({
      success: true,
      message: 'Đã xóa tất cả thông báo thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa tất cả thông báo',
      error: error.message
    });
  }
};

// Lấy số lượng thông báo chưa đọc
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user._id);
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy số lượng thông báo chưa đọc',
      error: error.message
    });
  }
};
