const { body, param } = require('express-validator');
const mongoose = require('mongoose');

const validateMongoId = param('reportedUserId').custom((value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error('ID không hợp lệ');
  }
  return true;
});

const validateCreateReport = [
  body('reported_user_id')
    .notEmpty().withMessage('ID người bị report không được bỏ trống')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('ID người dùng không hợp lệ');
      }
      return true;
    }),
  body('reason')
    .notEmpty().withMessage('Lý do report không được bỏ trống')
    .isIn(['spam', 'inappropriate', 'harassment', 'fake_account', 'other'])
    .withMessage('Lý do report không hợp lệ'),
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Mô tả không được vượt quá 500 ký tự'),
  body('evidence')
    .optional()
    .isArray().withMessage('Evidence phải là một mảng'),
  body('evidence.*.type')
    .optional()
    .isIn(['image', 'link', 'text']).withMessage('Loại evidence không hợp lệ'),
  body('evidence.*.content')
    .optional()
    .notEmpty().withMessage('Nội dung evidence không được bỏ trống')
];

const validateUpdateReportStatus = [
  param('reportId').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('Report ID không hợp lệ');
    }
    return true;
  }),
  body('status')
    .notEmpty().withMessage('Trạng thái không được bỏ trống')
    .isIn(['pending', 'resolved', 'rejected']).withMessage('Trạng thái không hợp lệ'),
  body('admin_note')
    .optional()
    .isLength({ max: 500 }).withMessage('Ghi chú không được vượt quá 500 ký tự')
];

module.exports = {
  validateMongoId,
  validateCreateReport,
  validateUpdateReportStatus
}; 