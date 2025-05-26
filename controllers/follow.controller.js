const followService = require('../services/follow.service');

// Follow một người dùng
exports.followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const follow = await followService.followUser(req.user._id, userId);
    
    res.status(200).json({
      success: true,
      data: follow
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Unfollow một người dùng
exports.unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await followService.unfollowUser(req.user._id, userId);
    
    res.status(200).json({
      success: true,
      message: 'Đã unfollow thành công'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Lấy danh sách người đang follow
exports.getFollowing = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await followService.getFollowing(
      req.user._id,
      parseInt(page),
      parseInt(limit)
    );
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách following',
      error: error.message
    });
  }
};

// Lấy danh sách người đang follow mình
exports.getFollowers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await followService.getFollowers(
      req.user._id,
      parseInt(page),
      parseInt(limit)
    );
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách followers',
      error: error.message
    });
  }
};

// Kiểm tra trạng thái follow
exports.checkFollowStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const isFollowing = await followService.checkFollowStatus(req.user._id, userId);
    
    res.status(200).json({
      success: true,
      data: { isFollowing }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi kiểm tra trạng thái follow',
      error: error.message
    });
  }
};

// Lấy số lượng following và followers
exports.getFollowCounts = async (req, res) => {
  try {
    const counts = await followService.getFollowCounts(req.user._id);
    
    res.status(200).json({
      success: true,
      data: counts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy số lượng follow',
      error: error.message
    });
  }
}; 