const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  review_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Review', 
    required: [true, 'Review ID không được bỏ trống']
  },
  author_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Author ID không được bỏ trống']
  },
  content: { 
    type: String, 
    required: [true, 'Nội dung comment không được bỏ trống'],
    minlength: [1, 'Comment phải có ít nhất 1 ký tự'],
    maxlength: [500, 'Comment không được vượt quá 500 ký tự']
  },
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  level: {
    type: Number,
    default: 0
  },
  reports: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      required: true,
      enum: ['spam', 'inappropriate', 'harassment', 'other']
    },
    description: {
      type: String,
      maxlength: [500, 'Mô tả không được vượt quá 500 ký tự']
    },
    created_at: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'rejected'],
      default: 'pending'
    }
  }],
  likes: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  }],
  created_at: { 
    type: Date, 
    default: Date.now 
  },
  updated_at: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
commentSchema.index({ review_id: 1 });
commentSchema.index({ author_id: 1 });
commentSchema.index({ parent_id: 1 });
commentSchema.index({ created_at: -1 });
commentSchema.index({ 'likes.user_id': 1 });
commentSchema.index({ 'reports.user_id': 1 });
commentSchema.index({ 'reports.status': 1 });

// Virtuals
commentSchema.virtual('likes_count').get(function() {
  return this.likes ? this.likes.length : 0;
});

commentSchema.virtual('reports_count').get(function() {
  return this.reports ? this.reports.length : 0;
});

// Middleware để tự động set level dựa trên parent_id
commentSchema.pre('save', async function(next) {
  if (this.isNew && this.parent_id) {
    const parentComment = await this.constructor.findById(this.parent_id);
    if (parentComment) {
      this.level = parentComment.level + 1;
    }
  }
  next();
});

// Phương thức kiểm tra user đã like chưa
commentSchema.methods.isLikedByUser = function(userId) {
  return this.likes.some(like => like.user_id.toString() === userId.toString());
};

// Phương thức kiểm tra user đã report chưa
commentSchema.methods.isReportedByUser = function(userId) {
  return this.reports.some(report => 
    report.user_id.toString() === userId.toString() && 
    report.status === 'pending'
  );
};

// Phương thức để lấy tất cả replies của một comment
commentSchema.methods.getReplies = async function() {
  return await this.constructor.find({ parent_id: this._id })
    .populate('author_id', 'profile.username profile.avatar_url')
    .sort({ created_at: 1 });
};

// Phương thức để lấy comment tree
commentSchema.statics.getCommentTree = async function(reviewId) {
  const comments = await this.find({ 
    review_id: reviewId, // Lấy tất cả comment gốc của review
    parent_id: null
  })
  .populate('author_id', 'profile.username profile.avatar_url')
  .sort({ created_at: -1 });

  // Hàm đệ quy để lấy replies
  const getReplies = async (comment) => {
    const replies = await this.find({ parent_id: comment._id })
      .populate('author_id', 'profile.username profile.avatar_url')
      .sort({ created_at: 1 });
    
    comment = comment.toObject();
    comment.replies = replies;
    
    // Đệ quy cho mỗi reply
    for (let reply of comment.replies) {
      reply.replies = await getReplies(reply);
    }
    
    return comment;
  };

  // Lấy replies cho mỗi comment gốc
  const commentsWithReplies = await Promise.all(
    comments.map(async (comment) => {
      return await getReplies(comment);
    })
  );

  return commentsWithReplies;
};

module.exports = mongoose.model('Comment', commentSchema);
