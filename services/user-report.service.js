const UserReport = require('../models/user-report.model');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');

class UserReportService {
  // Tạo report mới
  async createReport(data, reporterId) {
    const { reported_user_id, reason, description, evidence } = data;

    // Kiểm tra user bị report có tồn tại
    const reportedUser = await User.findById(reported_user_id);
    if (!reportedUser) {
      throw new Error('Không tìm thấy người dùng');
    }

    // Kiểm tra user đã report chưa
    const existingReport = await UserReport.findOne({
      reporter_id: reporterId,
      reported_user_id,
      status: 'pending'
    });

    if (existingReport) {
      throw new Error('Bạn đã report người dùng này');
    }

    // Tạo report mới
    const report = new UserReport({
      reported_user_id,
      reporter_id: reporterId,
      reason,
      description,
      evidence
    });

    await report.save();

    // Cập nhật thông tin user bị report
    reportedUser.report_count += 1;
    reportedUser.last_reported_at = Date.now();
    await reportedUser.save();

    // Tạo notification cho admin
    await Notification.create({
      user_id: process.env.ADMIN_ID,
      type: 'new_user_report',
      payload: {
        report_id: report._id,
        reported_user_id,
        reporter_id: reporterId,
        reason
      }
    });

    return report;
  }

  // Lấy danh sách report
  async getReports({ page = 1, limit = 20, status, reported_user_id }) {
    const query = {};
    if (status) query.status = status;
    if (reported_user_id) query.reported_user_id = reported_user_id;

    const reports = await UserReport.find(query)
      .populate('reported_user_id', 'profile.username profile.avatar_url')
      .populate('reporter_id', 'profile.username profile.avatar_url')
      .populate('resolved_by', 'profile.username')
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await UserReport.countDocuments(query);

    return {
      reports,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    };
  }

  // Cập nhật trạng thái report
  async updateReportStatus(reportId, data, adminId) {
    const { status, admin_note } = data;

    const report = await UserReport.findById(reportId)
      .populate('reported_user_id');

    if (!report) {
      throw new Error('Không tìm thấy report');
    }

    report.status = status;
    report.admin_note = admin_note;
    report.resolved_by = adminId;

    await report.save();

    // Nếu report được chấp nhận, ban user
    if (status === 'resolved') {
      const user = report.reported_user_id;
      user.status = 'banned';
      user.ban_info = {
        reason: report.reason,
        description: admin_note,
        banned_by: adminId,
        banned_at: Date.now(),
        ban_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Ban 30 ngày
      };
      await user.save();

      // Thông báo cho user bị ban
      await Notification.create({
        user_id: user._id,
        type: 'user_banned',
        payload: {
          reason: report.reason,
          description: admin_note,
          ban_expires_at: user.ban_info.ban_expires_at
        }
      });
    }

    return report;
  }

  // Kiểm tra trạng thái report của user
  async checkReportStatus(reportedUserId, reporterId) {
    const report = await UserReport.findOne({
      reported_user_id: reportedUserId,
      reporter_id: reporterId,
      status: 'pending'
    });

    return {
      is_reported: !!report,
      report_id: report ? report._id : null
    };
  }

  // Lấy thống kê report
  async getReportStats() {
    const stats = await UserReport.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalReports = await UserReport.countDocuments();
    const totalBannedUsers = await User.countDocuments({ status: 'banned' });

    return {
      stats,
      total_reports: totalReports,
      total_banned_users: totalBannedUsers
    };
  }
}

module.exports = new UserReportService(); 