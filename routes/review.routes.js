const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.post('/', verifyToken, reviewController.createReview);
router.get('/game/:gameId', reviewController.getReviewsByGame);

// admin
router.get('/pending', verifyToken, requireRole('admin'), reviewController.getPendingReviews);
router.patch('/:reviewId/status', verifyToken, requireRole('admin'), reviewController.approveOrReject);

module.exports = router;
