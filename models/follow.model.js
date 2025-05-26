const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  following: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Tạo compound index để đảm bảo một người chỉ follow một người khác một lần
followSchema.index({ follower: 1, following: 1 }, { unique: true });

// Tạo compound index cho việc query danh sách followers/following
followSchema.index({ following: 1, created_at: -1 });
followSchema.index({ follower: 1, created_at: -1 });

module.exports = mongoose.model('Follow', followSchema); 