const Follow = require('../models/follow.model');
const User = require('../models/user.model');
const { Notification, NOTIFICATION_TYPES } = require('../models/notification.model');
const mongoose = require('mongoose');

// Follow một người dùng
exports.followUser = async (followerId, followingId) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    // Validation
    if (followerId.toString() === followingId.toString()) {
      throw new Error('Không thể follow chính mình');
    }

    // Kiểm tra người dùng tồn tại
    const followingUser = await User.findById(followingId).session(session);
    if (!followingUser) {
      throw new Error('Người dùng không tồn tại');
    }

    // Kiểm tra followingUser có bị banned không
    if (followingUser.status === 'banned') {
      throw new Error('Không thể follow người dùng đã bị khóa');
    }

    // Kiểm tra đã follow chưa
    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: followingId
    }).session(session);
    
    if (existingFollow) {
      throw new Error('Đã follow người dùng này');
    }

    // Tạo follow mới với session
    const follow = await Follow.create([{
      follower: followerId,
      following: followingId
    }], { session });

    await session.commitTransaction();

    // Tạo thông báo sau khi commit transaction
    try {
      const followerUser = await User.findById(followerId);
      await Notification.create({
        recipient: followingId,
        sender: followerId,
        type: NOTIFICATION_TYPES.FOLLOW,
        title: 'Có người theo dõi bạn',
        message: `${followerUser?.email || 'Ai đó'} đã bắt đầu theo dõi bạn`,
        data: {
          followerId: followerId,
          followerEmail: followerUser?.email,
          followId: follow[0]._id
        }
      });
    } catch (notificationError) {
      console.error('Notification creation failed:', notificationError);
      // Không throw error để không ảnh hưởng đến follow operation
    }

    return follow[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Unfollow một người dùng
exports.unfollowUser = async (followerId, followingId) => {
  try {
    const result = await Follow.findOneAndDelete({
      follower: followerId,
      following: followingId
    });

    if (!result) {
      throw new Error('Chưa follow người dùng này');
    }

    // Tạo thông báo unfollow (optional)
    try {
      const followerUser = await User.findById(followerId);
      await Notification.create({
        recipient: followingId,
        sender: followerId,
        type: NOTIFICATION_TYPES.UNFOLLOW,
        title: 'Có người đã bỏ theo dõi bạn',
        message: `${followerUser?.email || 'Ai đó'} đã bỏ theo dõi bạn`,
        data: {
          followerId: followerId,
          followerEmail: followerUser?.email
        }
      });
    } catch (notificationError) {
      console.error('Unfollow notification creation failed:', notificationError);
    }

    return result;
  } catch (error) {
    throw error;
  }
};

// Lấy danh sách người đang follow
exports.getFollowing = async (userId, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    
    const follows = await Follow.find({ follower: userId })
      .populate('following', 'email profile created_at status')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Follow.countDocuments({ follower: userId });

    return {
      following: follows.map(follow => ({
        user: follow.following,
        followedAt: follow.created_at,
        followId: follow._id
      })),
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: follows.length,
        totalRecords: total
      }
    };
  } catch (error) {
    throw error;
  }
};

// Lấy danh sách người đang follow mình
exports.getFollowers = async (userId, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    
    const follows = await Follow.find({ following: userId })
      .populate('follower', 'email profile created_at status')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Follow.countDocuments({ following: userId });

    return {
      followers: follows.map(follow => ({
        user: follow.follower,
        followedAt: follow.created_at,
        followId: follow._id
      })),
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: follows.length,
        totalRecords: total
      }
    };
  } catch (error) {
    throw error;
  }
};

// Kiểm tra xem đã follow chưa
exports.checkFollowStatus = async (followerId, followingId) => {
  try {
    const follow = await Follow.findOne({
      follower: followerId,
      following: followingId
    });
    
    return {
      isFollowing: !!follow,
      followedAt: follow ? follow.created_at : null,
      followId: follow ? follow._id : null
    };
  } catch (error) {
    throw error;
  }
};

// Lấy số lượng người đang follow và followers
exports.getFollowCounts = async (userId) => {
  try {
    const [followingCount, followersCount] = await Promise.all([
      Follow.countDocuments({ follower: userId }),
      Follow.countDocuments({ following: userId })
    ]);

    return {
      following: followingCount,
      followers: followersCount
    };
  } catch (error) {
    throw error;
  }
};

// Lấy mutual follows (những người cùng follow lẫn nhau)
exports.getMutualFollows = async (userId, targetUserId) => {
  try {
    const mutualFollows = await Follow.aggregate([
      {
        $match: {
          follower: mongoose.Types.ObjectId(userId)
        }
      },
      {
        $lookup: {
          from: 'follows',
          let: { following: '$following' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$follower', mongoose.Types.ObjectId(targetUserId)] },
                    { $eq: ['$following', '$$following'] }
                  ]
                }
              }
            }
          ],
          as: 'mutualFollow'
        }
      },
      {
        $match: {
          mutualFollow: { $ne: [] }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'following',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: '$user._id',
          email: '$user.email',
          profile: '$user.profile',
          followedAt: '$created_at'
        }
      }
    ]);

    return mutualFollows;
  } catch (error) {
    throw error;
  }
};