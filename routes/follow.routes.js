const express = require('express');
const router = express.Router();
const followController = require('../controllers/follow.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Áp dụng middleware xác thực cho tất cả các routes
router.use(verifyToken);

// Follow một người dùng
router.post('/:userId', followController.followUser);

// Unfollow một người dùng
router.delete('/:userId', followController.unfollowUser);

// Lấy danh sách người đang follow
router.get('/following', followController.getFollowing);

// Lấy danh sách người đang follow mình
router.get('/followers', followController.getFollowers);

// Kiểm tra trạng thái follow
router.get('/status/:userId', followController.checkFollowStatus);

// Lấy số lượng following và followers
router.get('/counts', followController.getFollowCounts);

module.exports = router; 