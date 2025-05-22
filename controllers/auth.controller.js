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
    await authService.logout(req.user);
    res.status(204).send();  // 204 No Content
  } catch (err) {
    next(err);
  }
};
exports.verifyEmail = async (req, res, next) => {
  const { otp, token, email } = req.query;

  // Kiểm tra OTP
  if (otp) {
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: 'OTP không hợp lệ' });
    }

    if (user.otp_expiration < Date.now()) {
      return res.status(400).json({ message: 'OTP đã hết hạn' });
    }

    // Xác nhận thành công, cập nhật trạng thái user
    user.is_verified = true;
    user.otp = undefined;  // Xoá OTP sau khi xác nhận
    user.otp_expiration = undefined;  // Xoá thời gian hết hạn OTP
    await user.save();

    return res.status(200).json({ message: 'Xác nhận tài khoản qua OTP thành công' });
  }

  // Kiểm tra Link Xác Nhận
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(400).json({ message: 'User không tồn tại' });
      }

      if (user.is_verified) {
        return res.status(400).json({ message: 'Tài khoản đã được xác nhận' });
      }

      user.is_verified = true;
      await user.save();

      return res.status(200).json({ message: 'Xác nhận tài khoản qua link thành công' });
    } catch (err) {
      next(err);
    }
  }

  res.status(400).json({ message: 'Vui lòng cung cấp OTP hoặc token xác nhận' });
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