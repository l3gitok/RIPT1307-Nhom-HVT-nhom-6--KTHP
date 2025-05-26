const Follow = require('../models/follow.model');
const User = require('../models/user.model');
const notificationService = require('./notification.service');
const { NOTIFICATION_TYPES } = require('../models/notification.model');

// Follow một người dùng
exports.followUser = async (followerId, followingId) => {
  // Kiểm tra không thể follow chính mình
  if (followerId.toString() === followingId.toString()) {
    throw new Error('Không thể follow chính mình');
  }

  // Kiểm tra người dùng tồn tại
  const followingUser = await User.findById(followingId);
  if (!followingUser) {
    throw new Error('Người dùng không tồn tại');
  }

  // Kiểm tra đã follow chưa
  const existingFollow = await Follow.findOne({
    follower: followerId,
    following: followingId
  });
  if (existingFollow) {
    throw new Error('Đã follow người dùng này');
  }

  // Tạo follow mới
  const follow = await Follow.create({
    follower: followerId,
    following: followingId
  });

  // Cập nhật User model
  await Promise.all([
    User.findByIdAndUpdate(followerId, {
      $addToSet: { following: followingId }
    }),
    User.findByIdAndUpdate(followingId, {
      $addToSet: { followers: followerId }
    })
  ]);

  // Tạo thông báo cho người được follow
  await notificationService.createNotification({
    user_id: followingId,
    type: NOTIFICATION_TYPES.FOLLOW,
    payload: {
      follower_id: followerId,
      follower_name: (await User.findById(followerId)).username
    }
  });

  return follow;
};

// Unfollow một người dùng
exports.unfollowUser = async (followerId, followingId) => {
  const result = await Follow.findOneAndDelete({
    follower: followerId,
    following: followingId
  });

  if (!result) {
    throw new Error('Chưa follow người dùng này');
  }

  // Cập nhật User model
  await Promise.all([
    User.findByIdAndUpdate(followerId, {
      $pull: { following: followingId }
    }),
    User.findByIdAndUpdate(followingId, {
      $pull: { followers: followerId }
    })
  ]);

  return result;
};

// Lấy danh sách người đang follow
exports.getFollowing = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  const follows = await Follow.find({ follower: userId })
    .populate('following', 'username avatar')
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Follow.countDocuments({ follower: userId });

  return {
    follows,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit)
  };
};

// Lấy danh sách người đang follow mình
exports.getFollowers = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  const follows = await Follow.find({ following: userId })
    .populate('follower', 'username avatar')
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Follow.countDocuments({ following: userId });

  return {
    follows,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit)
  };
};

// Kiểm tra xem đã follow chưa
exports.checkFollowStatus = async (followerId, followingId) => {
  const follow = await Follow.findOne({
    follower: followerId,
    following: followingId
  });
  return !!follow;
};

// Lấy số lượng người đang follow và followers
exports.getFollowCounts = async (userId) => {
  const [followingCount, followersCount] = await Promise.all([
    Follow.countDocuments({ follower: userId }),
    Follow.countDocuments({ following: userId })
  ]);

  return {
    following: followingCount,
    followers: followersCount
  };
}; 