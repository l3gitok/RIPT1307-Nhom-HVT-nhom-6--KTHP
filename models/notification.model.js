const mongoose = require('mongoose');

// Định nghĩa các loại thông báo
const NOTIFICATION_TYPES = {
  FOLLOW: 'follow',
  UNFOLLOW: 'unfollow', 
  LIKE_POST: 'like_post',
  COMMENT_POST: 'comment_post',
  LIKE_REVIEW: 'like_review',
  COMMENT_REVIEW: 'comment_review',
  SYSTEM: 'system',
  GAME_UPDATE: 'game_update'
};

const notificationSchema = new mongoose.Schema({
  recipient: {
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
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  is_read: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = {
  Notification: mongoose.model('Notification', notificationSchema),
  NOTIFICATION_TYPES
};
