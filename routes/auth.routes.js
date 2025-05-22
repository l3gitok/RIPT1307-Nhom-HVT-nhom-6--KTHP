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

module.exports = router;
