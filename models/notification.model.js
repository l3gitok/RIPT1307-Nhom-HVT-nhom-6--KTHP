const mongoose = require('mongoose');

// Định nghĩa các loại thông báo
const NOTIFICATION_TYPES = {
  FRIEND_REQUEST: 'FRIEND_REQUEST',
  FRIEND_ACCEPTED: 'FRIEND_ACCEPTED',
  GAME_INVITE: 'GAME_INVITE',
  GAME_RESULT: 'GAME_RESULT',
  SYSTEM: 'SYSTEM'
};

const notificationSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true,
    description: 'ID của người dùng nhận thông báo'
  },
  type: { 
    type: String, 
    required: true,
    enum: Object.values(NOTIFICATION_TYPES),
    description: 'Loại thông báo'
  },
  payload: { 
    type: mongoose.Schema.Types.Mixed,
    description: 'Dữ liệu bổ sung của thông báo'
  },
  read: { 
    type: Boolean, 
    default: false,
    index: true,
    description: 'Trạng thái đã đọc của thông báo'
  },
  created_at: { 
    type: Date, 
    default: Date.now,
    index: true,
    description: 'Thời gian tạo thông báo'
  },
  updated_at: {
    type: Date,
    default: Date.now,
    description: 'Thời gian cập nhật thông báo'
  }
}, {
  timestamps: true // Tự động cập nhật created_at và updated_at
});

// Tạo compound index cho việc query thông báo theo user và thời gian
notificationSchema.index({ user_id: 1, created_at: -1 });

// Tạo compound index cho việc query thông báo chưa đọc
notificationSchema.index({ user_id: 1, read: 1 });

module.exports = {
  Notification: mongoose.model('Notification', notificationSchema),
  NOTIFICATION_TYPES
};
