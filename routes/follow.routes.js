// routes/follow.routes.js - Updated version
const express = require('express');
const router = express.Router();
const followController = require('../controllers/follow.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { 
  validateUserId, 
  validatePagination, 
  validateFollowRequest 
} = require('../middlewares/follow.validation');
const { handleValidationErrors } = require('../middlewares/error.middleware');

// Áp dụng middleware xác thực cho tất cả các routes
router.use(verifyToken);

// Follow một người dùng
router.post('/:userId', 
  validateFollowRequest,
  handleValidationErrors,
  followController.followUser
);

// Unfollow một người dùng
router.delete('/:userId', 
  validateUserId,
  handleValidationErrors,
  followController.unfollowUser
);

// Lấy danh sách người đang follow (của current user)
router.get('/following', 
  validatePagination,
  handleValidationErrors,
  followController.getFollowing
);

// Lấy danh sách người đang follow mình (của current user)
router.get('/followers', 
  validatePagination,
  handleValidationErrors,
  followController.getFollowers
);

// Lấy danh sách người đang follow (của user khác)
router.get('/:userId/following', 
  validateUserId,
  validatePagination,
  handleValidationErrors,
  followController.getFollowing
);

// Lấy danh sách người đang follow (của user khác)
router.get('/:userId/followers', 
  validateUserId,
  validatePagination,
  handleValidationErrors,
  followController.getFollowers
);

// Kiểm tra trạng thái follow
router.get('/status/:userId', 
  validateUserId,
  handleValidationErrors,
  followController.checkFollowStatus
);

// Lấy số lượng following và followers
router.get('/counts/:userId?', 
  followController.getFollowCounts
);

// Lấy mutual follows
router.get('/mutual/:userId', 
  validateUserId,
  handleValidationErrors,
  followController.getMutualFollows
);

module.exports = router;