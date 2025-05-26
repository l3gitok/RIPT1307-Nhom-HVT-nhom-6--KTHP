const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const upload = require('../middlewares/upload.middleware');
const { verifyToken } = require('../middlewares/auth.middleware');

// Áp dụng middleware xác thực cho tất cả các routes
router.use(verifyToken);

// Upload ảnh thông thường
router.post('/image', upload.single('image'), uploadController.uploadImage);

// Upload avatar
router.post('/avatar', upload.single('avatar'), uploadController.uploadAvatar);

// Upload nhiều ảnh cho bài đăng
router.post('/images', upload.array('images', 10), uploadController.uploadMultipleImages);

// Xóa ảnh
router.delete('/:public_id', uploadController.deleteImage);

module.exports = router;
