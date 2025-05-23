const Like = require('../models/like.model');

exports.toggleLike = async (userId, targetType, targetId, reaction = 'like') => {
  // Kiểm tra đã like chưa
  const existing = await Like.findOne({ user: userId, targetType, targetId });
  if (existing) {
    // Nếu cùng reaction thì bỏ like, nếu khác thì cập nhật reaction
    if (existing.reaction === reaction) {
      await existing.remove();
      return { liked: false };
    } else {
      existing.reaction = reaction;
      await existing.save();
      return { liked: true, reaction };
    }
  }
  // Nếu chưa like thì tạo mới
  await Like.create({ user: userId, targetType, targetId, reaction });
  return { liked: true, reaction };
};
exports.countReactions = async (targetType, targetId) => {
  const likes = await Like.countDocuments({ targetType, targetId, reaction: 'like' });
  const dislikes = await Like.countDocuments({ targetType, targetId, reaction: 'dislike' });
  // Có thể mở rộng cho các reaction khác
  return { likes, dislikes };
};
exports.getLikers = async (targetType, targetId, reaction = 'like') => {
  return Like.find({ targetType, targetId, reaction }).populate('user', 'email profile');
};