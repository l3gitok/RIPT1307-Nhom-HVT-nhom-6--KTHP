const express = require('express');
const router = express.Router();
const { 
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
} = require('../controllers/notification.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Lấy danh sách thông báo (có phân trang)
router.get('/', verifyToken, getNotifications);

// Lấy số lượng thông báo chưa đọc
router.get('/unread/count', verifyToken, getUnreadCount);

// Đánh dấu một thông báo đã đọc
router.patch('/:notificationId/read', verifyToken, markAsRead);

// Đánh dấu tất cả thông báo đã đọc
router.patch('/read-all', verifyToken, markAllAsRead);

// Xóa một thông báo
router.delete('/:notificationId', verifyToken, deleteNotification);

// Xóa tất cả thông báo
router.delete('/', verifyToken, deleteAllNotifications);

module.exports = router;
