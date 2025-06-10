const mongoose = require('mongoose');

// Định nghĩa các loại thông báo
const NOTIFICATION_TYPES = {
  FOLLOW: 'follow', // User A follows User B
  UNFOLLOW: 'unfollow', // User A unfollows User B
  LIKE_REVIEW: 'like_review', // User A likes User B's review
  NEW_COMMENT_ON_REVIEW: 'new_comment_on_review', // User A comments on User B's review
  NEW_REPLY_TO_COMMENT: 'new_reply_to_comment', // User A replies to User B's comment
  LIKE_COMMENT: 'like_comment', // User A likes User B's comment
  SYSTEM: 'system', // General system notifications
  GAME_UPDATE: 'game_update', // Game information updated
  COMMENT_REPORTED_ADMIN: 'comment_reported_admin', // A comment was reported (to Admins)
  COMMENT_STATUS_UPDATED: 'comment_status_updated' // User's comment status changed (e.g., rejected)
};

const notificationSchema = new mongoose.Schema({
  user_id: { // Đổi tên từ recipient
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  type: {
    type: String,
    enum: Object.values(NOTIFICATION_TYPES),
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  payload: { // Đổi tên từ data
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  read: { // Đổi tên từ is_read
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } // Cấu hình tên trường timestamps
});

// ✅ Standardized export
module.exports = {
  Notification: mongoose.model('Notification', notificationSchema),
  NOTIFICATION_TYPES: NOTIFICATION_TYPES
};
