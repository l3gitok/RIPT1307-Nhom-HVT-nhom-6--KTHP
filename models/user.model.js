const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  username: { type: String },
  avatar_url: { type: String },
  cover_url: { type: String }
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^\S+@\S+\.\S+$/ // Kiểm tra email hợp lệ
  },
  hashed_password: { type: String, required: function() { return !this.google_id; } }, // Chỉ yêu cầu mật khẩu nếu không có google_id
  google_id: { type: String },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
    required: true
  },
  profile: profileSchema,
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  created_at: { type: Date, default: Date.now },
  otp: { type: String }, // OTP cho xác nhận tài khoản
  otp_expiration: { type: Date }, // Thời gian hết hạn của OTP
  is_verified: { type: Boolean, default: false }, // Trạng thái xác nhận email
  refresh_token: { type: String },
  status: {
    type: String,
    enum: ['active', 'banned', 'deleted'],
    default: 'active'
  },
  ban_info: {
    reason: {
      type: String,
    },
    description: String,
    banned_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    banned_at: Date,
    ban_expires_at: Date,
    ban_type: {
      type: String,
      enum: ['direct', 'report'],
      default: 'direct'
    },
    report_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserReport'
    }
  },
  report_count: {
    type: Number,
    default: 0
  },
  last_reported_at: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
