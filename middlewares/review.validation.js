const { body, param, query, validationResult } = require('express-validator');

exports.validateReview = [
  body('content').isLength({ min: 10 }).withMessage('Review phải có ít nhất 10 ký tự'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating từ 1-5'),
  body('game_id').isMongoId().withMessage('Game ID không hợp lệ')
];

exports.validateCreateReview = [
  body('content')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Nội dung review phải từ 10-2000 ký tự'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating phải từ 1-5'),
  body('game_id')
    .isMongoId()
    .withMessage('Game ID không hợp lệ'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images phải là mảng'),
  body('images.*')
    .optional()
    .isURL()
    .withMessage('URL hình ảnh không hợp lệ'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }
    next();
  }
];

exports.validateUpdateReview = [
  body('content')
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Nội dung review phải từ 10-2000 ký tự'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating phải từ 1-5'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images phải là mảng'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }
    next();
  }
];

exports.validateUpdateStatus = [
  body('status')
    .isIn(['pending', 'approved', 'rejected'])
    .withMessage('Status phải là pending, approved hoặc rejected'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Status không hợp lệ',
        errors: errors.array()
      });
    }
    next();
  }
];

exports.validateReply = [
  body('content')
    .isLength({ min: 1, max: 500 })
    .withMessage('Nội dung phản hồi phải từ 1-500 ký tự'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }
    next();
  }
];

exports.validateMongoId = [
  param('id').isMongoId().withMessage('ID không hợp lệ'),
  param('gameId').optional().isMongoId().withMessage('Game ID không hợp lệ'),
  param('userId').optional().isMongoId().withMessage('User ID không hợp lệ'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ',
        errors: errors.array()
      });
    }
    next();
  }
];