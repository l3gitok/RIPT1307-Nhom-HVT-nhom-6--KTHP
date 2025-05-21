const notificationService = require('../services/notification.service');

exports.getNotifications = async (req, res, next) => {
  try {
    const noti = await notificationService.getNotificationsForUser(req.user.id);
    res.json(noti);
  } catch (err) {
    next(err);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    const noti = await notificationService.markAsRead(req.params.id);
    res.json(noti);
  } catch (err) {
    next(err);
  }
};
