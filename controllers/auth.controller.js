const authService = require('../services/auth.service');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

exports.googleLoginCallback = async (req, res, next) => {
  try {
    const user = req.user; // `user` được Passport trả về sau khi xác thực thành công với Google
    // Cập nhật trạng thái tài khoản là đã xác nhận
    user.is_verified = true;
    await user.save();
    // Tạo Access Token và Refresh Token cho người dùng sau khi đăng nhập qua Google
    const { accessToken, refreshToken } = authService.generateTokens(user._id, user.role);

    // Trả về Access Token, Refresh Token và thông tin người dùng
    res.json({ accessToken, refreshToken, user });
  } catch (err) {
    next(err);
  }
};

exports.refreshAccessToken = async (req, res, next) => {
  try {
    const result = await authService.refreshAccessToken(req.body.refreshToken);
    res.json(result);
  } catch (err) {
    // Có thể trả về mã lỗi phù hợp ở đây
    next(err);
  }
};

exports.register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
exports.logout = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Clear refresh token from database
    await authService.clearRefreshToken(userId);

    res.json({
      success: true,
      message: 'Đăng xuất thành công!'
    });
  } catch (error) {
    console.error('Logout error:', error);
    next(error);
  }
};
exports.verifyEmail = async (req, res, next) => {
  try {
    const result = await authService.verifyEmail(req.query);
    res.status(result.status).json({ message: result.message });
  } catch (err) {
    next(err);
  }
};
exports.forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body.email);
    res.json({ message: 'Đã gửi email đặt lại mật khẩu' });
  } catch (err) {
    next(err);
  }
};
exports.resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req.body.token, req.body.newPassword);
    res.json({ message: 'Đặt lại mật khẩu thành công' });
  } catch (err) {
    next(err);
  }
};

// Lấy thông tin user hiện tại
exports.getCurrentUser = async (req, res, next) => {
  try {
    // req.user đã được set bởi JWT middleware
    const user = await authService.getUserById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User không tồn tại'
      });
    }

    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    next(error);
  }
};

// Lấy thông tin user theo ID (public profile)
exports.getUserData = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validation
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'User ID không hợp lệ'
      });
    }

    const user = await authService.getPublicUserProfile(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User không tồn tại'
      });
    }

    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('Get user data error:', error);
    next(error);
  }
};

// Lấy tất cả users (admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'profile.username': { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (status) query.is_verified = status === 'verified';

    const result = await authService.getAllUsers({
      ...query,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Get all users error:', error);
    next(error);
  }
};

// Cập nhật profile
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { username, avatar_url, cover_url, bio } = req.body;

    // Validation
    if (username && username.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username phải có ít nhất 3 ký tự'
      });
    }

    const updatedUser = await authService.updateUserProfile(userId, {
      username,
      avatar_url,
      cover_url,
      bio
    });

    res.json({
      success: true,
      user: updatedUser,
      message: 'Cập nhật profile thành công!'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    next(error);
  }
};

// Debug token
exports.debugToken = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({
      success: true,
      decoded,
      message: 'Token is valid'
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: error.message
    });
  }
};