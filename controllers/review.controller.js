const reviewService = require('../services/review.service');


exports.getAllReviews = async (req, res, next) => {
  try {
    const result = await reviewService.getAllReviews(req.query);
    res.json({ 
      success: true, 
      ...result 
    });
  } catch (error) {
    next(error);
  }
};

exports.getReviewById = async (req, res, next) => {
  try {
    const review = await reviewService.getReviewById(req.params.id);
    res.json({ 
      success: true, 
      review 
    });
  } catch (error) {
    next(error);
  }
};

exports.getReviewsByGame = async (req, res, next) => {
  try {
    const result = await reviewService.getReviewsByGame(req.params.gameId, req.query);
    res.json({ 
      success: true, 
      ...result 
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyReviews = async (req, res, next) => {
  try {
    const result = await reviewService.getReviewsByUser(req.user.id, req.query);
    res.json({ 
      success: true, 
      ...result 
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserReviews = async (req, res, next) => {
  try {
    const result = await reviewService.getReviewsByUser(req.params.userId, req.query);
    res.json({ 
      success: true, 
      ...result 
    });
  } catch (error) {
    next(error);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const review = await reviewService.createReview(req.body, req.user.id);
    res.status(201).json({ 
      success: true, 
      review,
      message: 'Tạo review thành công! Đang chờ duyệt.' 
    });
  } catch (error) {
    next(error);
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    const review = await reviewService.updateReview(
      req.params.id, 
      req.body, 
      req.user.id, 
      req.user.role
    );
    res.json({ 
      success: true, 
      review,
      message: 'Cập nhật review thành công!' 
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const result = await reviewService.deleteReview(
      req.params.id, 
      req.user.id, 
      req.user.role
    );
    res.json({ 
      success: true, 
      ...result 
    });
  } catch (error) {
    next(error);
  }
};

exports.updateReviewStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const review = await reviewService.updateReviewStatus(
      req.params.id, 
      status, 
      req.user.id
    );
    res.json({ 
      success: true, 
      review,
      message: `Review đã được ${status === 'approved' ? 'duyệt' : 'từ chối'}!` 
    });
  } catch (error) {
    next(error);
  }
};

exports.likeReview = async (req, res, next) => {
  try {
    const result = await reviewService.likeReview(req.params.id, req.user.id);
    res.json({ 
      success: true, 
      ...result,
      message: result.liked ? 'Đã like review!' : 'Đã bỏ like review!' 
    });
  } catch (error) {
    next(error);
  }
};

exports.addReply = async (req, res, next) => {
  try {
    const reply = await reviewService.addReply(req.params.id, req.body, req.user.id);
    res.status(201).json({ 
      success: true, 
      reply,
      message: 'Đã thêm phản hồi!' 
    });
  } catch (error) {
    next(error);
  }
};

exports.getReviewStats = async (req, res, next) => {
  try {
    const stats = await reviewService.getReviewStats();
    res.json({ 
      success: true, 
      ...stats 
    });
  } catch (error) {
    next(error);
  }
};
