const commentService = require('../services/comment.service');
const reviewService = require('../services/review.service');
const notificationService = require('../services/notification.service');
const { NOTIFICATION_TYPES } = require('../models/notification.model');
const { validationResult } = require('express-validator');

// Lấy danh sách comment của một review
exports.getCommentsByReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { page, limit, sort } = req.query;
    
    const result = await commentService.getCommentsByReview(reviewId, { page, limit, sort });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Lấy chi tiết một comment
exports.getCommentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await commentService.getCommentById(id);
    res.json(comment);
  } catch (error) {
    next(error);
  }
};

// Tạo comment mới
exports.createComment = async (req, res) => {
  try {
    const { review_id, content, parent_id } = req.body;
    const author_id = req.user.id || req.user._id;

    console.log('Creating comment:', { review_id, content, author_id });

    // Validate required fields
    if (!review_id || !content) {
      return res.status(400).json({
        success: false,
        message: 'Review ID and content are required'
      });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content cannot be empty'
      });
    }

    if (content.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Comment content cannot exceed 1000 characters'
      });
    }

    // Check if review exists
    const review = await reviewService.getReviewById(review_id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Create comment data
    const commentData = {
      review_id,
      content: content.trim(),
      author_id,
      parent_id: parent_id || null,
      level: parent_id ? 1 : 0,
      status: 'active'
    };

    console.log('Comment data to create:', commentData);

    // Create comment
    const newComment = await commentService.createComment(commentData);
    console.log('Comment created:', newComment);

    // ✅ Create notification với proper error handling
    try {
      // Only create notification if commenter is not the review author
      if (review.author_id.toString() !== author_id.toString()) {
        await notificationService.createNotification({
          recipient: review.author_id,
          sender: author_id,
          type: NOTIFICATION_TYPES.COMMENT_REVIEW,
          title: 'Bình luận mới',
          message: `${req.user.profile?.username || req.user.email} đã bình luận về review của bạn`,
          data: {
            review_id,
            comment_id: newComment._id,
            review_title: review.title || 'Review'
          }
        });
        console.log('Notification created successfully');
      }
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the comment creation if notification fails
    }

    res.status(201).json({
      success: true,
      data: newComment,
      message: 'Comment created successfully'
    });

  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

// Cập nhật comment
exports.updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    const comment = await commentService.updateComment(id, { content }, userId, isAdmin);
    res.json(comment);
  } catch (error) {
    next(error);
  }
};

// Xóa comment
exports.deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    const result = await commentService.deleteComment(id, userId, isAdmin);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Like/Unlike comment
exports.toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const result = await commentService.toggleLike(id, userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách người đã like comment
exports.getLikes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;

    const result = await commentService.getLikes(id, { page, limit });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Kiểm tra trạng thái like của user
exports.checkLikeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const result = await commentService.checkLikeStatus(id, userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Thêm reply cho comment
exports.addReply = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const comment = await commentService.addReply(req.params.id, req.body, req.user._id);
    res.json(comment);
  } catch (error) {
    if (error.message === 'Không tìm thấy comment') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật trạng thái comment (Admin only)
exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const comment = await commentService.updateStatus(id, status);
    res.json(comment);
  } catch (error) {
    next(error);
  }
};

// Report comment
exports.reportComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { reason, description } = req.body;

    const comment = await commentService.reportComment(id, userId, { reason, description });
    res.json(comment);
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách report của comment
exports.getReports = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit, status } = req.query;

    const result = await commentService.getReports(id, { page, limit, status });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Cập nhật trạng thái report (Admin only)
exports.updateReportStatus = async (req, res, next) => {
  try {
    const { id, reportId } = req.params;
    const { status } = req.body;

    const comment = await commentService.updateReportStatus(id, reportId, status);
    res.json(comment);
  } catch (error) {
    next(error);
  }
};

// Kiểm tra trạng thái report của user
exports.checkReportStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const result = await commentService.checkReportStatus(id, userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
