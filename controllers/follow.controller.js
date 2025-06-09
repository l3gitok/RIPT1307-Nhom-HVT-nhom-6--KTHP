const followService = require('../services/follow.service');
const { validationResult } = require('express-validator');

// Follow một người dùng
exports.followUser = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const { userId } = req.params;
    const follow = await followService.followUser(req.user._id, userId);
    
    res.status(201).json({
      success: true,
      message: 'Đã follow thành công',
      data: {
        follow,
        action: 'followed'
      }
    });
  } catch (error) {
    console.error('Follow error:', error);
    
    if (error.message === 'Không thể follow chính mình') {
      return res.status(400).json({
        success: false,
        message: error.message,
        code: 'SELF_FOLLOW_ERROR'
      });
    }
    
    if (error.message === 'Đã follow người dùng này') {
      return res.status(400).json({
        success: false,
        message: error.message,
        code: 'DUPLICATE_FOLLOW_ERROR',
        suggestion: 'Use unfollow endpoint to unfollow'
      });
    }
    
    if (error.message === 'Người dùng không tồn tại') {
      return res.status(404).json({
        success: false,
        message: error.message,
        code: 'USER_NOT_FOUND'
      });
    }

    if (error.message === 'Không thể follow người dùng đã bị khóa') {
      return res.status(403).json({
        success: false,
        message: error.message,
        code: 'USER_BANNED'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi follow user',
      code: 'INTERNAL_SERVER_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Unfollow một người dùng
exports.unfollowUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const { userId } = req.params;
    await followService.unfollowUser(req.user._id, userId);
    
    res.status(200).json({
      success: true,
      message: 'Đã unfollow thành công',
      data: {
        action: 'unfollowed'
      }
    });
  } catch (error) {
    console.error('Unfollow error:', error);
    
    if (error.message === 'Chưa follow người dùng này') {
      return res.status(400).json({
        success: false,
        message: error.message,
        code: 'NOT_FOLLOWING_ERROR'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi unfollow user',
      code: 'INTERNAL_SERVER_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Lấy danh sách người đang follow
exports.getFollowing = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.params.userId || req.user._id;
    
    const result = await followService.getFollowing(
      userId,
      parseInt(page),
      parseInt(limit)
    );
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách following',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Lấy danh sách người đang follow mình
exports.getFollowers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.params.userId || req.user._id;
    
    const result = await followService.getFollowers(
      userId,
      parseInt(page),
      parseInt(limit)
    );
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách followers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Kiểm tra trạng thái follow
exports.checkFollowStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const status = await followService.checkFollowStatus(req.user._id, userId);
    
    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Check follow status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi kiểm tra trạng thái follow',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Lấy số lượng following và followers
exports.getFollowCounts = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    const counts = await followService.getFollowCounts(userId);
    
    res.status(200).json({
      success: true,
      data: counts
    });
  } catch (error) {
    console.error('Get follow counts error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy số lượng follow',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Lấy mutual follows
exports.getMutualFollows = async (req, res) => {
  try {
    const { userId } = req.params;
    const mutuals = await followService.getMutualFollows(req.user._id, userId);
    
    res.status(200).json({
      success: true,
      data: {
        mutualFollows: mutuals,
        count: mutuals.length
      }
    });
  } catch (error) {
    console.error('Get mutual follows error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách mutual follows',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};