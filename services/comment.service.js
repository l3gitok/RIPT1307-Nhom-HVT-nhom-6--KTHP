const Comment = require('../models/comment.model');
const Review = require('../models/review.model');
const Notification = require('../models/notification.model');

class CommentService {
  // Lấy danh sách comment của một review (dạng tree)
  async getCommentsByReview(reviewId, { page = 1, limit = 10, sort = '-created_at' }) {
    const comments = await Comment.getCommentTree(reviewId);
    
    // Phân trang cho comments gốc
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedComments = comments.slice(startIndex, endIndex);

    return {
      comments: paginatedComments,
      total: comments.length,
      page: parseInt(page),
      totalPages: Math.ceil(comments.length / limit)
    };
  }

  // Lấy chi tiết một comment và tất cả replies
  async getCommentById(id) {
    const comment = await Comment.findById(id)
      .populate('author_id', 'profile.username profile.avatar_url')
      .populate('review_id');

    if (!comment) {
      throw new Error('Không tìm thấy comment');
    }

    // Lấy tất cả replies
    const replies = await comment.getReplies();
    comment.replies = replies;

    return comment;
  }

  // Tạo comment mới
  async createComment(data, authorId) {
    const { content, review_id, parent_id } = data;

    // Kiểm tra review có tồn tại
    const review = await Review.findById(review_id);
    if (!review) {
      throw new Error('Không tìm thấy review');
    }

    // Nếu là reply, kiểm tra parent comment
    if (parent_id) {
      const parentComment = await Comment.findById(parent_id);
      if (!parentComment) {
        throw new Error('Không tìm thấy comment gốc');
      }
      if (parentComment.review_id.toString() !== review_id) {
        throw new Error('Comment gốc không thuộc review này');
      }
    }

    const comment = new Comment({
      content,
      review_id,
      author_id: authorId,
      parent_id
    });

    await comment.save();

    // Tạo notification
    if (parent_id) {
      // Thông báo cho chủ comment gốc
      const parentComment = await Comment.findById(parent_id);
      if (parentComment.author_id.toString() !== authorId.toString()) {
        await Notification.create({
          user_id: parentComment.author_id,
          type: 'new_reply',
          payload: {
            comment_id: comment._id,
            parent_comment_id: parent_id,
            author_id: authorId
          }
        });
      }
    } else {
      // Thông báo cho chủ review
      if (review.author_id.toString() !== authorId.toString()) {
        await Notification.create({
          user_id: review.author_id,
          type: 'new_comment',
          payload: {
            comment_id: comment._id,
            review_id: review._id,
            author_id: authorId
          }
        });
      }
    }

    return comment;
  }

  // Cập nhật comment
  async updateComment(id, data, userId, isAdmin) {
    const comment = await Comment.findById(id);
    if (!comment) {
      throw new Error('Không tìm thấy comment');
    }

    // Kiểm tra quyền chỉnh sửa
    if (comment.author_id.toString() !== userId.toString() && !isAdmin) {
      throw new Error('Không có quyền chỉnh sửa comment này');
    }

    const { content } = data;
    comment.content = content;
    comment.updated_at = Date.now();

    await comment.save();
    return comment;
  }

  // Xóa comment
  async deleteComment(id, userId, isAdmin) {
    const comment = await Comment.findById(id);
    if (!comment) {
      throw new Error('Không tìm thấy comment');
    }

    // Kiểm tra quyền xóa
    if (comment.author_id.toString() !== userId.toString() && !isAdmin) {
      throw new Error('Không có quyền xóa comment này');
    }

    // Xóa tất cả replies
    await Comment.deleteMany({ parent_id: id });

    await comment.remove();
    return { message: 'Đã xóa comment thành công' };
  }

  // Like/Unlike comment
  async toggleLike(id, userId) {
    const comment = await Comment.findById(id)
      .populate('author_id', 'profile.username profile.avatar_url');

    if (!comment) {
      throw new Error('Không tìm thấy comment');
    }

    const isLiked = comment.isLikedByUser(userId);

    if (isLiked) {
      // Unlike
      comment.likes = comment.likes.filter(
        like => like.user_id.toString() !== userId.toString()
      );
    } else {
      // Like
      comment.likes.push({ user_id: userId });
    }

    await comment.save();

    // Tạo notification cho chủ comment
    if (!isLiked && comment.author_id.toString() !== userId.toString()) {
      await Notification.create({
        user_id: comment.author_id,
        type: 'new_like',
        payload: {
          comment_id: comment._id,
          user_id: userId
        }
      });
    }

    return {
      ...comment.toObject(),
      is_liked: !isLiked
    };
  }

  // Lấy danh sách người đã like comment
  async getLikes(id, { page = 1, limit = 20 }) {
    const comment = await Comment.findById(id)
      .populate('likes.user_id', 'profile.username profile.avatar_url');

    if (!comment) {
      throw new Error('Không tìm thấy comment');
    }

    const likes = comment.likes
      .sort((a, b) => b.created_at - a.created_at)
      .slice((page - 1) * limit, page * limit);

    return {
      likes,
      total: comment.likes.length,
      page: parseInt(page),
      totalPages: Math.ceil(comment.likes.length / limit)
    };
  }

  // Kiểm tra user đã like comment chưa
  async checkLikeStatus(id, userId) {
    const comment = await Comment.findById(id);
    if (!comment) {
      throw new Error('Không tìm thấy comment');
    }

    return {
      is_liked: comment.isLikedByUser(userId),
      likes_count: comment.likes_count
    };
  }

  // Cập nhật trạng thái comment (Admin only)
  async updateStatus(id, status) {
    const comment = await Comment.findById(id);
    if (!comment) {
      throw new Error('Không tìm thấy comment');
    }

    comment.status = status;
    await comment.save();
    return comment;
  }

  // Report comment
  async reportComment(id, userId, data) {
    const { reason, description } = data;
    const comment = await Comment.findById(id)
      .populate('author_id', 'profile.username profile.avatar_url');

    if (!comment) {
      throw new Error('Không tìm thấy comment');
    }

    // Kiểm tra user đã report chưa
    if (comment.isReportedByUser(userId)) {
      throw new Error('Bạn đã report comment này');
    }

    // Thêm report mới
    comment.reports.push({
      user_id: userId,
      reason,
      description
    });

    await comment.save();

    // Tạo notification cho admin
    await Notification.create({
      user_id: process.env.ADMIN_ID, // ID của admin
      type: 'new_report',
      payload: {
        comment_id: comment._id,
        user_id: userId,
        reason
      }
    });

    return comment;
  }

  // Lấy danh sách report của comment
  async getReports(id, { page = 1, limit = 20, status }) {
    const comment = await Comment.findById(id)
      .populate('reports.user_id', 'profile.username profile.avatar_url');

    if (!comment) {
      throw new Error('Không tìm thấy comment');
    }

    let reports = comment.reports;
    
    // Lọc theo status nếu có
    if (status) {
      reports = reports.filter(report => report.status === status);
    }

    // Sắp xếp theo thời gian tạo mới nhất
    reports.sort((a, b) => b.created_at - a.created_at);

    // Phân trang
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedReports = reports.slice(startIndex, endIndex);

    return {
      reports: paginatedReports,
      total: reports.length,
      page: parseInt(page),
      totalPages: Math.ceil(reports.length / limit)
    };
  }

  // Cập nhật trạng thái report (Admin only)
  async updateReportStatus(id, reportId, status) {
    const comment = await Comment.findById(id);
    if (!comment) {
      throw new Error('Không tìm thấy comment');
    }

    const report = comment.reports.id(reportId);
    if (!report) {
      throw new Error('Không tìm thấy report');
    }

    report.status = status;
    await comment.save();

    // Nếu report được chấp nhận, cập nhật trạng thái comment
    if (status === 'resolved') {
      comment.status = 'rejected';
      await comment.save();

      // Thông báo cho chủ comment
      await Notification.create({
        user_id: comment.author_id,
        type: 'comment_rejected',
        payload: {
          comment_id: comment._id,
          reason: report.reason
        }
      });
    }

    return comment;
  }

  // Kiểm tra trạng thái report của user
  async checkReportStatus(id, userId) {
    const comment = await Comment.findById(id);
    if (!comment) {
      throw new Error('Không tìm thấy comment');
    }

    return {
      is_reported: comment.isReportedByUser(userId),
      reports_count: comment.reports_count
    };
  }
}

module.exports = new CommentService();
