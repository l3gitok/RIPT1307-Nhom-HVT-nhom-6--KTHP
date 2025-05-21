const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/', verifyToken, notificationController.getNotifications);
router.patch('/:id/read', verifyToken, notificationController.markRead);

module.exports = router;
