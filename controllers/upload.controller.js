// controllers/upload.controller.js
const cloudinary = require('../config/cloudinary');

// Upload ảnh thông thường
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy file ảnh'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        url: req.file.path,
        public_id: req.file.filename
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi upload ảnh',
      error: error.message
    });
  }
};

// Upload và tối ưu ảnh avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy file ảnh'
      });
    }

    // Tối ưu ảnh avatar
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'gamehub/avatars',
      width: 200,
      height: 200,
      crop: 'fill',
      gravity: 'face',
      quality: 'auto',
      fetch_format: 'auto'
    });

    res.status(200).json({
      success: true,
      data: {
        url: result.secure_url,
        public_id: result.public_id
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi upload avatar',
      error: error.message
    });
  }
};

// Upload nhiều ảnh cho bài đăng
exports.uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy file ảnh'
      });
    }

    const uploadPromises = req.files.map(file => 
      cloudinary.uploader.upload(file.path, {
        folder: 'gamehub/posts',
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      })
    );

    const results = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      data: results.map(result => ({
        url: result.secure_url,
        public_id: result.public_id
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi upload nhiều ảnh',
      error: error.message
    });
  }
};

// Xóa ảnh
exports.deleteImage = async (req, res) => {
  try {
    const { public_id } = req.params;
    
    const result = await cloudinary.uploader.destroy(public_id);
    
    if (result.result !== 'ok') {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa ảnh'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Xóa ảnh thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa ảnh',
      error: error.message
    });
  }
};
