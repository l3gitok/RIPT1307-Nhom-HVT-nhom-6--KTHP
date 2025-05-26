const mongoose = require('mongoose');

const userReportSchema = new mongoose.Schema({
  reported_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID người bị report không được bỏ trống']
  },
  reporter_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID người report không được bỏ trống']
  },
  reason: {
    type: String,
    required: [true, 'Lý do report không được bỏ trống'],
    enum: ['spam', 'inappropriate', 'harassment', 'fake_account', 'other']
  },
  description: {
    type: String,
    maxlength: [500, 'Mô tả không được vượt quá 500 ký tự']
  },
  evidence: [{
    type: {
      type: String,
      enum: ['image', 'link', 'text']
    },
    content: String,
    created_at: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'resolved', 'rejected'],
    default: 'pending'
  },
  admin_note: {
    type: String,
    maxlength: [500, 'Ghi chú không được vượt quá 500 ký tự']
  },
  resolved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolved_at: Date,
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
userReportSchema.index({ reported_user_id: 1, status: 1 });
userReportSchema.index({ reporter_id: 1 });
userReportSchema.index({ status: 1 });
userReportSchema.index({ created_at: -1 });

// Virtuals
userReportSchema.virtual('evidence_count').get(function() {
  return this.evidence ? this.evidence.length : 0;
});

// Middleware
userReportSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'resolved') {
    this.resolved_at = Date.now();
  }
  next();
});

module.exports = mongoose.model('UserReport', userReportSchema); 