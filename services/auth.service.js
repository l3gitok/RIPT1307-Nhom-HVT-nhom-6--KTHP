const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const generateTokens = require('../utils/token.util');
const sendEmail = require('../utils/email.util');
const jwt = require('jsonwebtoken');



exports.generateTokens = (userId, role) => {
  const accessToken = jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: '30d' });

  return { accessToken, refreshToken };
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
  let hashed_password = null;
  if (password) {
    if(!passwword || password.trim() === '') {
      throw new Error('Password is required');
    }
    hashed_password = await bcrypt.hash(password, 10);
  }


    
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

  const { accessToken, refreshToken } = this.generateTokens(user._id, user.role);

  user.refresh_token = refreshToken;
  await user.save();

  return { accessToken, refreshToken, user };
};

exports.login = async ({ email, password }) => {
  // Kiểm tra người dùng có tồn tại không
  const user = await User.findOne({ email });
  if (!user) throw new Error('Email không tồn tại');

  // Kiểm tra mật khẩu
  const isMatch = await bcrypt.compare(password, user.hashed_password);
  if (!isMatch) throw new Error('Mật khẩu không chính xác');

  // Tạo Access Token với thời gian sống (ví dụ 1 giờ)
  const accessToken = generateTokens(user._id, user.role, '1h'); // token hết hạn sau 1 giờ

  // Tạo Refresh Token với thời gian sống dài hơn (ví dụ 30 ngày)
  const refreshToken = generateTokens(user._id, user.role, '30d'); // token hết hạn sau 30 ngày

  // Trả về cả Access Token và Refresh Token
  return { accessToken, refreshToken, user };
};

exports.logout = async (user) => {
  // Option: Ghi log thời điểm logout vào DB nếu muốn theo dõi
  return { message: 'Logout success (stateless)' };
};