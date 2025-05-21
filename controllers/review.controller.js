const reviewService = require('../services/review.service');


exports.createReview = async (req, res, next) => {
  try {
    const review = await reviewService.createReview(req.body, req.user.id);
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

exports.getReviewsByGame = async (req, res, next) => {
  try {
    const reviews = await reviewService.getReviewsByGame(req.params.gameId);
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

exports.getPendingReviews = async (req, res, next) => {
  try {
    const pending = await reviewService.getPendingReviews();
    res.json(pending);
  } catch (err) {
    next(err);
  }
};

exports.approveOrReject = async (req, res, next) => {
  try {
    
    const { status } = req.body;
    const updated = await reviewService.updateReviewStatus(req.params.reviewId, status);
    await notificationService.createNotification({
      user_id: updated.author_id,
      type: 'review_approved',
      payload: { reviewId: updated._id }
    });

    const io = req.app.get('io');
    io.to(updated.author_id.toString()).emit('notification', {
      type: 'review_approved',
      payload: { reviewId: updated._id }
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};
