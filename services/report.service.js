const Report = require('../models/report.model');

exports.createReport = async (data, userId) => {
  return await Report.create({
    ...data,
    reporter_id: userId,
    handled: false
  });
};

exports.getPendingReports = async () => {
  return await Report.find({ handled: false }).populate('reporter_id', 'profile.username');
};

exports.resolveReport = async (reportId, action) => {
  return await Report.findByIdAndUpdate(
    reportId,
    {
      handled: true,
      action,
      handled_at: new Date()
    },
    { new: true }
  );
};
