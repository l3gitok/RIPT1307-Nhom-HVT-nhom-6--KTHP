const reportService = require('../services/report.service');

exports.createReport = async (req, res, next) => {
  try {
    const report = await reportService.createReport(req.body, req.user.id);
    res.status(201).json(report);
  } catch (err) {
    next(err);
  }
};

exports.getPendingReports = async (req, res, next) => {
  try {
    const reports = await reportService.getPendingReports();
    res.json(reports);
  } catch (err) {
    next(err);
  }
};

exports.resolveReport = async (req, res, next) => {
  try {
    const report = await reportService.resolveReport(req.params.reportId, req.body.action);
    res.json(report);
  } catch (err) {
    next(err);
  }
};
