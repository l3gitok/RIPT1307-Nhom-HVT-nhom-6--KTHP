const Review = require('../models/review.model');

exports.createReview = async (data, userId) => {
  return await Review.create({
    ...data,
    author_id: userId,
    status: 'pending',
    created_at: new Date()
  });
};

exports.getReviewsByGame = async (gameId) => {
  return await Review.find({ game_id: gameId, status: 'approved' })
    .populate('author_id', 'profile.username')
    .sort({ created_at: -1 });
};

exports.getPendingReviews = async () => {
  return await Review.find({ status: 'pending' }).populate('game_id').populate('author_id');
};

exports.updateReviewStatus = async (reviewId, status) => {
  return await Review.findByIdAndUpdate(
    reviewId,
    { status, updated_at: new Date() },
    { new: true }
  );
};
