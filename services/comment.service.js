const Comment = require('../models/comment.model');

exports.createComment = async ({ review_id, content }, userId) => {
  return await Comment.create({
    review_id,
    author_id: userId,
    content,
    created_at: new Date()
  });
};

exports.getCommentsByReview = async (reviewId) => {
  return await Comment.find({ review_id: reviewId })
    .populate('author_id', 'profile.username')
    .sort({ created_at: -1 });
};
