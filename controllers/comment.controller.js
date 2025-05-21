const commentService = require('../services/comment.service');

exports.createComment = async (req, res, next) => {
  try {
    const comment = await commentService.createComment(req.body, req.user.id);
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};

exports.getCommentsByReview = async (req, res, next) => {
  try {
    const comments = await commentService.getCommentsByReview(req.params.reviewId);
    res.json(comments);
  } catch (err) {
    next(err);
  }
};
