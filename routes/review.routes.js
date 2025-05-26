const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const reviewValidation = require('../middlewares/review.validation');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Public routes
router.get('/', reviewController.getAllReviews);
router.get('/stats', reviewController.getReviewStats);
router.get('/:id', reviewValidation.validateMongoId, reviewController.getReviewById);
router.get('/game/:gameId', reviewValidation.validateMongoId, reviewController.getReviewsByGame);
router.get('/user/:userId', reviewValidation.validateMongoId, reviewController.getUserReviews);

// Protected routes (cần đăng nhập)
router.use(verifyToken);

router.get('/my/reviews', reviewController.getMyReviews);
router.post('/', reviewValidation.validateCreateReview, reviewController.createReview);
router.put('/:id', reviewValidation.validateMongoId, reviewValidation.validateUpdateReview, reviewController.updateReview);
router.delete('/:id', reviewValidation.validateMongoId, reviewController.deleteReview);

// Like/Unlike review
router.post('/:id/like', reviewValidation.validateMongoId, reviewController.likeReview);

// Reply to review
router.post('/:id/reply', reviewValidation.validateMongoId, reviewValidation.validateReply, reviewController.addReply);

// Admin only routes
router.patch('/:id/status', reviewValidation.validateMongoId, reviewValidation.validateUpdateStatus, isAdmin, reviewController.updateReviewStatus);

module.exports = router;
