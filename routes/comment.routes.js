const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const commentValidation = require('../middlewares/comment.validation');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Public routes
router.get('/review/:reviewId', commentController.getCommentsByReview);
router.get('/:id', commentValidation.validateMongoId, commentController.getCommentById);

// Protected routes (cần đăng nhập)
router.use(verifyToken);

router.post('/', commentValidation.validateCreateComment, commentController.createComment);
router.put('/:id', commentValidation.validateMongoId, commentValidation.validateUpdateComment, commentController.updateComment);
router.delete('/:id', commentValidation.validateMongoId, commentController.deleteComment);

// Like routes
router.post('/:id/like', commentValidation.validateMongoId, commentController.toggleLike);
router.get('/:id/likes', commentValidation.validateMongoId, commentController.getLikes);
router.get('/:id/like-status', commentValidation.validateMongoId, commentController.checkLikeStatus);

// Report routes
router.post('/:id/report', commentValidation.validateReport, commentController.reportComment);
router.get('/:id/reports', commentValidation.validateMongoId, isAdmin, commentController.getReports);
router.get('/:id/report-status', commentValidation.validateMongoId, commentController.checkReportStatus);
router.patch('/:id/reports/:reportId/status', commentValidation.validateUpdateReportStatus, isAdmin, commentController.updateReportStatus);

// Reply to comment
router.post('/:id/reply', commentValidation.validateReply, commentController.addReply);

module.exports = router;
