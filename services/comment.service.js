const Comment = require('../models/comment.model');
const Review = require('../models/review.model');
const notificationService = require('../services/notification.service');
const { NOTIFICATION_TYPES } = require('../models/notification.model'); // This import will now work correctly
const User = require('../models/user.model');
 
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

    // Tạo notification sử dụng service
    const senderUser = await User.findById(authorId).select('profile.username').lean();
    const senderUsername = senderUser?.profile?.username || 'Một người dùng';

    if (parent_id) {
      // Thông báo cho chủ comment gốc
      const parentComment = await Comment.findById(parent_id);
      if (parentComment.author_id.toString() !== authorId.toString()) {
        await notificationService.createNotification({
          recipient: parentComment.author_id,
          sender: authorId,
          type: NOTIFICATION_TYPES.NEW_REPLY_TO_COMMENT,
          title: 'Có trả lời mới cho bình luận của bạn',
          message: `${senderUsername} đã trả lời bình luận của bạn: "${comment.content.substring(0, 50)}${comment.content.length > 50 ? '...' : ''}"`,
          data: {
            comment_id: comment._id,
            parent_comment_id: parent_id,
            review_id: review._id, // review đã được fetch ở trên
            sender_id: authorId
          }
        });
      }
    } else {
      // Thông báo cho chủ review
      if (review.author_id.toString() !== authorId.toString()) {
        // Populate game title for a richer message
        const populatedReview = await Review.findById(review_id).populate('game_id', 'title').lean();
        const gameTitle = populatedReview?.game_id?.title || 'một game';

        await notificationService.createNotification({
          recipient: review.author_id,
          sender: authorId,
          type: NOTIFICATION_TYPES.NEW_COMMENT_ON_REVIEW,
          title: 'Có bình luận mới trên review của bạn',
          message: `${senderUsername} đã bình luận trên review của bạn cho game "${gameTitle}": "${comment.content.substring(0, 50)}${comment.content.length > 50 ? '...' : ''}"`,
          data: {
            comment_id: comment._id,
            review_id: review._id,
            sender_id: authorId,
            game_id: populatedReview?.game_id?._id
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

    // Tạo notification cho chủ comment khi có like mới
    if (!isLiked && comment.author_id.toString() !== userId.toString()) {
      const senderUser = await User.findById(userId).select('profile.username').lean();
      const senderUsername = senderUser?.profile?.username || 'Một người dùng';
      await notificationService.createNotification({
        recipient: comment.author_id._id, // comment.author_id is populated
        sender: userId,
        type: NOTIFICATION_TYPES.LIKE_COMMENT,
        title: 'Bình luận của bạn được thích',
        message: `${senderUsername} đã thích bình luận của bạn: "${comment.content.substring(0, 50)}${comment.content.length > 50 ? '...' : ''}"`,
        data: {
          comment_id: comment._id,
          sender_id: userId
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

    // Tạo notification cho tất cả admin
    const admins = await User.find({ role: 'admin' }).select('_id').lean();
    const reporterUser = await User.findById(userId).select('profile.username').lean();
    const reporterUsername = reporterUser?.profile?.username || 'Một người dùng';
    const commentAuthorUsername = comment.author_id?.profile?.username || 'một người dùng khác'; // author_id is populated

    for (const admin of admins) {
      await notificationService.createNotification({
        recipient: admin._id,
        sender: userId,
        type: NOTIFICATION_TYPES.COMMENT_REPORTED_ADMIN,
        title: 'Bình luận bị báo cáo',
        message: `Người dùng ${reporterUsername} đã báo cáo một bình luận của ${commentAuthorUsername}. Lý do: ${reason}`,
        data: {
          comment_id: comment._id,
          reported_by_id: userId,
          comment_author_id: comment.author_id._id,
          reason: reason,
          report_description: description
        }
      });
    }
    return comment; // Return the original comment object
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

      // Thông báo cho chủ comment về việc comment bị từ chối
      await notificationService.createNotification({
        recipient: comment.author_id,
        sender: null, // Hoặc ID của admin thực hiện hành động nếu cần
        type: NOTIFICATION_TYPES.COMMENT_STATUS_UPDATED,
        title: 'Bình luận của bạn đã bị từ chối',
        message: `Bình luận của bạn "${comment.content.substring(0, 50)}${comment.content.length > 50 ? '...' : ''}" đã bị từ chối. Lý do: ${report.reason}`,
        data: {
          comment_id: comment._id,
          new_status: 'rejected',
          reason: report.reason,
          report_id: reportId
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
