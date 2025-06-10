const { body, param } = require('express-validator');
const mongoose = require('mongoose');

const validateMongoId = param('id').custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error('ID không hợp lệ');
  }
  return true;
});

const validateCreateComment = [
  body('content')
    .notEmpty().withMessage('Nội dung comment không được bỏ trống')
    .isLength({ min: 1, max: 500 }).withMessage('Comment phải từ 1-500 ký tự'),
  body('review_id')
    .notEmpty().withMessage('Review ID không được bỏ trống')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Review ID không hợp lệ');
      }
      return true;
    })
];

const validateUpdateComment = [
  validateMongoId,
  body('content')
    .notEmpty().withMessage('Nội dung comment không được bỏ trống')
    .isLength({ min: 1, max: 500 }).withMessage('Comment phải từ 1-500 ký tự')
];

const validateReply = [
  validateMongoId,
  body('content')
    .notEmpty().withMessage('Nội dung reply không được bỏ trống')
    .isLength({ min: 1, max: 500 }).withMessage('Reply phải từ 1-500 ký tự')
];

const validateReport = [
  validateMongoId,
  body('reason')
    .notEmpty().withMessage('Lý do report không được bỏ trống')
    .isIn(['spam', 'inappropriate', 'harassment', 'other']).withMessage('Lý do report không hợp lệ'),
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Mô tả không được vượt quá 500 ký tự')
];

const validateUpdateReportStatus = [
  param('id').isMongoId().withMessage('ID comment không hợp lệ'),
  param('reportId').isMongoId().withMessage('ID report không hợp lệ'),
  body('status')
    .notEmpty().withMessage('Trạng thái report không được bỏ trống')
    .isIn(['pending', 'resolved', 'rejected']).withMessage('Trạng thái report không hợp lệ')
];



module.exports = {
  validateMongoId,
  validateCreateComment,
  validateUpdateComment,
  validateReply,
  validateReport,
  validateUpdateReportStatus
};