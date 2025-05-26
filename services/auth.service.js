const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const {generateTokens}= require('../utils/token.util');
const sendEmail = require('../utils/email.util');
const jwt = require('jsonwebtoken');


exports.refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    const err = new Error('Refresh Token is required');
    err.status = 401;
    throw err;
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  } catch {
    const err = new Error('Invalid Refresh Token');
    err.status = 403;
    throw err;
  }

  const user = await User.findById(decoded.id);
  if (!user || user.refresh_token !== refreshToken) {
    const err = new Error('Invalid Refresh Token');
    err.status = 401;
    throw err;
  }

  const { accessToken, refreshToken: newRefreshToken } =generateTokens(user._id, user.role);
  user.refresh_token = newRefreshToken;
  await user.save();

  return { accessToken, refreshToken: newRefreshToken };
};

exports.register = async ({ email, password, profile }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new Error('Email already registered');

  if (!email || !password) {
    throw new Error('Email và mật khẩu là bắt buộc');
  }
  if (password.length < 6) {
    throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
  }
  const hashed_password = await bcrypt.hash(password, 10);

    
  const user = await User.create({
    email,
    hashed_password,
    role: 'user',
    profile
  });
  // Gửi email xác nhận
  const otp = Math.floor(100000 + Math.random() * 900000); // Tạo OTP ngẫu nhiên
  const verifyLink = `http://your-frontend-url.com/verify-email?otp=${otp}&email=${email}`;

  // Gửi email với OTP
  await sendEmail(email, 'Xác nhận tài khoản GameHub', '', `
    <h3>Chào bạn,</h3>
    <p>Vui lòng nhập mã OTP để xác nhận tài khoản: <strong>${otp}</strong></p>
    <p>Hoặc bạn có thể nhấp vào link dưới đây để xác nhận:</p>
    <a href="${verifyLink}">Xác nhận tài khoản</a>
  `);
  // Lưu OTP vào DB (hoặc trong cache) để sau này xác nhận
  user.otp = otp;
  user.otp_expiration = Date.now() + 15 * 60 * 1000; // OTP hết hạn sau 15 phút
  await user.save();

  const { accessToken, refreshToken } = generateTokens(user._id, user.role);

  user.refresh_token = refreshToken;
  await user.save();

  return { accessToken, refreshToken, user };
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Email không tồn tại');
  const isMatch = await bcrypt.compare(password, user.hashed_password);
  if (!isMatch) throw new Error('Mật khẩu không chính xác');

  const { accessToken, refreshToken } =generateTokens(user._id, user.role);
  user.refresh_token = refreshToken;
  await user.save();

  return { accessToken, refreshToken, user };
};


exports.logout = async (user) => {
  user.refresh_token = null;
  await user.save();
  return { message: 'Logout success' };
};
exports.forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Email không tồn tại');
  const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const resetLink = `http://localhost:8000/user/reset-password?token=${resetToken}`;
  await sendEmail(email, 'Đặt lại mật khẩu', '', `
    <p>Bạn vừa yêu cầu đặt lại mật khẩu.</p>
    <a href="${resetLink}">Nhấn vào đây để đặt lại mật khẩu</a>
  `);
};
exports.resetPassword = async (token, newPassword) => {
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new Error('Token không hợp lệ hoặc đã hết hạn');
  }
  const user = await User.findById(decoded.id);
  if (!user) throw new Error('User không tồn tại');
  user.hashed_password = await bcrypt.hash(newPassword, 10);
  await user.save();
};
exports.verifyEmail = async ({ otp, token, email }) => {
  const User = require('../models/user.model');
  const jwt = require('jsonwebtoken');

  if (otp) {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp) {
      return { status: 400, message: 'OTP không hợp lệ' };
    }
    if (user.otp_expiration < Date.now()) {
      return { status: 400, message: 'OTP đã hết hạn' };
    }
    user.is_verified = true;
    user.otp = undefined;
    user.otp_expiration = undefined;
    await user.save();
    return { status: 200, message: 'Xác nhận tài khoản qua OTP thành công' };
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return { status: 400, message: 'User không tồn tại' };
      }
      if (user.is_verified) {
        return { status: 400, message: 'Tài khoản đã được xác nhận' };
      }
      user.is_verified = true;
      await user.save();
      return { status: 200, message: 'Xác nhận tài khoản qua link thành công' };
    } catch (err) {
      throw err;
    }
  }

  return { status: 400, message: 'Vui lòng cung cấp OTP hoặc token xác nhận' };
};

exports.getUserData = async (userId) => {
  const user = await User.findById(userId).select('-hashed_password -refresh_token -otp -otp_expiration');
  if (!user) {
    const err = new Error('User không tồn tại');
    err.status = 404;
    throw err;
  }
  return user;
};

// Lấy user theo ID (full info cho chính user đó)
exports.getUserById = async (userId) => {
  const user = await User.findById(userId)
    .select('-hashed_password -refresh_token -otp -otp_expiration')
    .lean();
  
  return user;
};

// Lấy public profile của user (cho người khác xem)
exports.getPublicUserProfile = async (userId) => {
  const user = await User.findById(userId)
    .select('email profile role is_verified created_at')
    .lean();
  
  return user;
};

// Lấy tất cả users với pagination
exports.getAllUsers = async (options = {}) => {
  const { page = 1, limit = 10, ...filters } = options;
  
  const users = await User.find(filters)
    .select('-hashed_password -refresh_token -otp -otp_expiration')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ created_at: -1 })
    .lean();
    
  const total = await User.countDocuments(filters);
  
  return {
    users,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page
  };
};

// Cập nhật profile user
exports.updateUserProfile = async (userId, profileData) => {
  const { username, avatar_url, cover_url, bio } = profileData;
  
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User không tồn tại');
    err.status = 404;
    throw err;
  }

  // Kiểm tra username trùng lặp
  if (username && username !== user.profile?.username) {
    const existingUser = await User.findOne({ 'profile.username': username });
    if (existingUser && existingUser._id.toString() !== userId) {
      const err = new Error('Username đã tồn tại');
      err.status = 400;
      throw err;
    }
  }

  // Cập nhật profile
  if (!user.profile) user.profile = {};
  if (username) user.profile.username = username;
  if (avatar_url) user.profile.avatar_url = avatar_url;
  if (cover_url) user.profile.cover_url = cover_url;
  if (bio !== undefined) user.profile.bio = bio;

  await user.save();
  
  return user.toObject({ 
    transform: (doc, ret) => {
      delete ret.hashed_password;
      delete ret.refresh_token;
      delete ret.otp;
      delete ret.otp_expiration;
      return ret;
    }
  });
};

// Clear refresh token khi logout
exports.clearRefreshToken = async (userId) => {
  await User.findByIdAndUpdate(userId, { 
    $unset: { refresh_token: 1 } 
  });
};
