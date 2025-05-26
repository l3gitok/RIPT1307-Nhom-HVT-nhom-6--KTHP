const userReportService = require('../services/user-report.service');

// Tạo report mới
exports.createReport = async (req, res, next) => {
  try {
    const { reported_user_id, reason, description, evidence } = req.body;
    const reporterId = req.user._id;

    const report = await userReportService.createReport(
      { reported_user_id, reason, description, evidence },
      reporterId
    );

    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách report
exports.getReports = async (req, res, next) => {
  try {
    const { page, limit, status, reported_user_id } = req.query;

    const result = await userReportService.getReports({
      page,
      limit,
      status,
      reported_user_id
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Cập nhật trạng thái report
exports.updateReportStatus = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const { status, admin_note } = req.body;
    const adminId = req.user._id;

    const report = await userReportService.updateReportStatus(
      reportId,
      { status, admin_note },
      adminId
    );

    res.json(report);
  } catch (error) {
    next(error);
  }
};

// Kiểm tra trạng thái report
exports.checkReportStatus = async (req, res, next) => {
  try {
    const { reportedUserId } = req.params;
    const reporterId = req.user._id;

    const result = await userReportService.checkReportStatus(reportedUserId, reporterId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Lấy thống kê report
exports.getReportStats = async (req, res, next) => {
  try {
    const stats = await userReportService.getReportStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
}; 