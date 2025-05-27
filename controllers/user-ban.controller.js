const userBanService = require('../services/user-ban.service');
const { isAdmin } = require('../middlewares/auth.middleware');

class UserBanController {
  // Ban user
  async banUser(req, res) {
    try {
      const { userId } = req.params;
      const { reason, description, ban_duration_days } = req.body;
      const adminId = req.user._id;

      const user = await userBanService.banUser(userId, adminId, {
        reason,
        description,
        ban_duration_days
      });

      res.json({
        success: true,
        message: 'Ban user thành công',
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Unban user
  async unbanUser(req, res) {
    try {
      const { userId } = req.params;
      const adminId = req.user._id;

      const user = await userBanService.unbanUser(userId, adminId);

      res.json({
        success: true,
        message: 'Unban user thành công',
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Lấy danh sách user bị ban
  async getBannedUsers(req, res) {
    try {
      const { page, limit } = req.query;
      
      const result = await userBanService.getBannedUsers({
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new UserBanController(); 