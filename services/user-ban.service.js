const User = require('../models/user.model');
const { Notification, NOTIFICATION_TYPES } = require('../models/notification.model');
const UserReport = require('../models/user-report.model');

class UserBanService {
  // Ban user trực tiếp
  async banUser(userId, adminId, data) {
    const { reason, description, ban_duration_days = 30, ban_type = 'direct', report_id = null } = data;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Không tìm thấy user');
    }

    if (user.status === 'banned') {
      throw new Error('User đã bị ban');
    }

    // Cập nhật thông tin ban
    user.status = 'banned';
    user.ban_info = {
      reason,
      description,
      banned_by: adminId,
      banned_at: Date.now(),
      ban_expires_at: new Date(Date.now() + ban_duration_days * 24 * 60 * 60 * 1000),
      ban_type,
      report_id
    };

    await user.save();

    // Tạo thông báo cho user bị ban
    await Notification.create({
      user_id: user._id,
      type: NOTIFICATION_TYPES.SYSTEM,
      payload: {
        reason,
        description,
        ban_expires_at: user.ban_info.ban_expires_at,
        ban_type
      }
    });

    return user;
  }

  // Ban user từ report
  async banUserFromReport(userId, adminId, reportId, data) {
    const report = await UserReport.findById(reportId);
    if (!report) {
      throw new Error('Không tìm thấy report');
    }

    return this.banUser(userId, adminId, {
      ...data,
      ban_type: 'report',
      report_id: reportId
    });
  }

  // Unban user
  async unbanUser(userId, adminId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Không tìm thấy user');
    }

    if (user.status !== 'banned') {
      throw new Error('User không trong trạng thái bị ban');
    }

    // Cập nhật trạng thái user
    user.status = 'active';
    user.ban_info = null;

    await user.save();

    // Tạo thông báo cho user được unban
    await Notification.create({
      user_id: user._id,
      type: NOTIFICATION_TYPES.SYSTEM,
      payload: {
        unbanned_by: adminId,
        unbanned_at: Date.now()
      }
    });

    return user;
  }

  // Lấy danh sách user bị ban
  async getBannedUsers(options = {}) {
    const { page = 1, limit = 10, ban_type } = options;
    
    const query = { status: 'banned' };
    if (ban_type) {
      query['ban_info.ban_type'] = ban_type;
    }
    
    const users = await User.find(query)
      .select('-hashed_password -refresh_token -otp -otp_expiration')
      .populate('ban_info.banned_by', 'profile.username')
      .populate('ban_info.report_id')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ 'ban_info.banned_at': -1 })
      .lean();
      
    const total = await User.countDocuments(query);
    
    return {
      users,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    };
  }

  // Lấy thống kê ban
  async getBanStats() {
    const stats = await User.aggregate([
      { $match: { status: 'banned' } },
      {
        $group: {
          _id: '$ban_info.ban_type',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalBanned = await User.countDocuments({ status: 'banned' });
    const totalDirectBans = await User.countDocuments({ 
      status: 'banned',
      'ban_info.ban_type': 'direct'
    });
    const totalReportBans = await User.countDocuments({
      status: 'banned',
      'ban_info.ban_type': 'report'
    });

    return {
      stats,
      total_banned: totalBanned,
      total_direct_bans: totalDirectBans,
      total_report_bans: totalReportBans
    };
  }
}

module.exports = new UserBanService(); 