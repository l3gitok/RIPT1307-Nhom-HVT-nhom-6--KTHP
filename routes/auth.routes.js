const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const authController = require('../controllers/auth.controller');


// Đăng nhập bằng Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback từ Google
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  authController.googleLoginCallback,  // Xử lý sau khi xác thực thành công
  (req, res) => {
    const generateToken = require('../utils/token.util');
    const token = generateToken(req.user._id, req.user.role);
    res.json({ token, user: req.user });  // Trả về token và user thông tin
  }
);
// Đăng ký, đăng nhập
router.post('/register', authController.register);
router.post('/login', authController.login);

// Xác nhận tài khoản qua OTP
router.get('/verify-email', authController.verifyEmail);

router.post('/refresh', authController.refreshAccessToken);  // Endpoint cấp lại Access Token


// Logout (Xóa token)
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Lấy thông tin user hiện tại (cần đăng nhập)
router.get('/me', passport.authenticate('jwt', { session: false }), authController.getCurrentUser);

// Lấy thông tin user theo ID (cần đăng nhập)
router.get('/user/:id', passport.authenticate('jwt', { session: false }), authController.getUserData);

// Lấy danh sách tất cả users (chỉ admin)
router.get('/users', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Chỉ admin mới có quyền truy cập' });
  }
  next();
}, authController.getAllUsers);

// Cập nhật profile user hiện tại
router.put('/profile', passport.authenticate('jwt', { session: false }), authController.updateProfile);

module.exports = router;
