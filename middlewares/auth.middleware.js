const jwt = require('jsonwebtoken');
const User = require('../models/user.model'); // Adjust path nếu cần

exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized – Missing token' 
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ✅ Thêm: Tìm user trong database để đảm bảo user vẫn tồn tại
    const user = await User.findById(decoded.userId || decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // ✅ Gán cả decoded và user object
    req.user = {
      ...decoded,
      ...user.toObject() // Convert mongoose doc to plain object
    };
    req.userId = user._id;
    
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized – Invalid token' 
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized – Token expired' 
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

exports.requireRole = (role) => (req, res, next) => {
  if (req.user?.role !== role) {
    return res.status(403).json({ 
      success: false,
      message: 'Forbidden – Access denied' 
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Chỉ admin mới có quyền truy cập'
    });
  }
};

exports.isModerator = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'moderator')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Không có quyền truy cập'
    });
  }
};

// ✅ Thêm: Optional auth cho các endpoint không bắt buộc login
exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId || decoded.id);
      
      if (user) {
        req.user = {
          ...decoded,
          ...user.toObject()
        };
        req.userId = user._id;
      }
    }
    
    next();
  } catch (error) {
    // Không throw error, chỉ bỏ qua nếu token không hợp lệ
    next();
  }
};