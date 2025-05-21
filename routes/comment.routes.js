const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/', verifyToken, commentController.createComment);
router.get('/review/:reviewId', commentController.getCommentsByReview);

module.exports = router;
