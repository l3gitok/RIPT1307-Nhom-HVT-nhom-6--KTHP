const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Nội dung review không được bỏ trống'],
    minlength: [10, 'Review phải có ít nhất 10 ký tự'],
    maxlength: [2000, 'Review không được vượt quá 2000 ký tự']
  },
  rating: {
    type: Number,
    required: [true, 'Rating không được bỏ trống'],
    min: [1, 'Rating tối thiểu là 1'],
    max: [5, 'Rating tối đa là 5']
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'URL hình ảnh không hợp lệ'
    }
  }],
  game_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: [true, 'Game ID không được bỏ trống']
  },
  author_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author ID không được bỏ trống']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
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
  replies: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 500
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  }],
  helpful_count: {
    type: Number,
    default: 0
  },
  is_featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
reviewSchema.virtual('likes_count').get(function() {
  return this.likes ? this.likes.length : 0;
});

reviewSchema.virtual('replies_count').get(function() {
  return this.replies ? this.replies.length : 0;
});

// Indexes
reviewSchema.index({ game_id: 1, status: 1 });
reviewSchema.index({ author_id: 1 });
reviewSchema.index({ created_at: -1 });
reviewSchema.index({ rating: 1 });

// Middleware để kiểm tra duplicate review
reviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingReview = await this.constructor.findOne({
      game_id: this.game_id,
      author_id: this.author_id
    });
    
    if (existingReview) {
      const err = new Error('Bạn đã review game này rồi');
      err.status = 400;
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model('Review', reviewSchema);