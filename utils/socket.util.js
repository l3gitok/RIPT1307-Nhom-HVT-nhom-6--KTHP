// utils/socket.util.js
const { getIO } = require('../config/socket');

exports.emitNotification = (userId, notification) => {
  // TODO: Implement emit notification logic
  getIO().emit(`notification:${userId}`, notification);
};
