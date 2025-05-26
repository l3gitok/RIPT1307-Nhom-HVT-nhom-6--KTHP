const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const authController = require('../controllers/auth.controller');

// ✅ Sửa đường dẫn và tên function
const { verifyToken, isAdmin, isModerator } = require('../middlewares/auth.middleware');

// ===========================================
// PUBLIC ROUTES (không cần authentication)
// ===========================================

// Đăng nhập bằng Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback từ Google
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  authController.googleLoginCallback,
  (req, res) => {
    try {
      const { generateToken } = require('../utils/token.util');
      const token = generateToken(req.user._id, req.user.role);
      res.json({ 
        success: true,
        token, 
        user: req.user 
      });
    } catch (error) {
      console.error('Google callback error:', error);
      res.status(500).json({
        success: false,
        message: 'Authentication failed'
      });
    }
  }
);

// Đăng ký, đăng nhập
router.post('/register', authController.register);
router.post('/login', authController.login);

// Xác nhận tài khoản qua OTP
router.get('/verify-email', authController.verifyEmail);

// Refresh token
router.post('/refresh', authController.refreshAccessToken);

// Forgot & Reset Password
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Logout
router.post('/logout', authController.logout);

// ===========================================
// PROTECTED ROUTES (cần authentication)
// ===========================================

// ✅ Sử dụng verifyToken thay vì requireAuth
router.use(verifyToken);

// ✅ Loại bỏ passport.authenticate('jwt') vì đã có verifyToken
// Lấy thông tin user hiện tại
router.get('/me', authController.getCurrentUser);

// Lấy thông tin user theo ID
router.get('/user/:id', authController.getUserData);

// Cập nhật profile user hiện tại
router.put('/profile', authController.updateProfile);

// ===========================================
// ADMIN ONLY ROUTES
// ===========================================

// ✅ Sử dụng isAdmin middleware
router.get('/users', isAdmin, authController.getAllUsers);

module.exports = router;
