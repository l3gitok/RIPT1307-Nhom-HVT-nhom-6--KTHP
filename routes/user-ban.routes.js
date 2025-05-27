const express = require('express');
const router = express.Router();
const userBanController = require('../controllers/user-ban.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Áp dụng middleware xác thực cho tất cả các routes
router.use(verifyToken);

// Ban user
router.post('/:userId/ban', isAdmin, userBanController.banUser);

// Unban user
router.post('/:userId/unban', isAdmin, userBanController.unbanUser);

// Lấy danh sách user bị ban
router.get('/banned', isAdmin, userBanController.getBannedUsers);

module.exports = router; 