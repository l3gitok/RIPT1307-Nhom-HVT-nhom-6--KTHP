const likeService = require('../services/like.service');

exports.likeTarget = async (req, res, next) => {
  try {
    const { reaction } = req.body; // optional: like, dislike, love, etc.
    const { id } = req.params;
    const targetType = req.targetType; // set từ middleware route
    const result = await likeService.toggleLike(req.user.id, targetType, id, reaction);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
exports.getReactionCount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const targetType = req.targetType;
    const result = await likeService.countReactions(targetType, id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
exports.getLikers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const targetType = req.targetType;
    const { reaction } = req.query; // optional: like/dislike
    const users = await likeService.getLikers(targetType, id, reaction || 'like');
    res.json(users);
  } catch (err) {
    next(err);
  }
};