// middlewares/follow.validation.js
const { body, param } = require('express-validator');
const mongoose = require('mongoose');

exports.validateUserId = [
  param('userId')
    .isMongoId()
    .withMessage('User ID không hợp lệ'),
];

exports.validatePagination = [
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page phải là số nguyên dương'),
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit phải từ 1-100')
];

exports.validateFollowRequest = [
  param('userId')
    .isMongoId()
    .withMessage('User ID không hợp lệ')
    .custom(async (userId, { req }) => {
      if (userId === req.user._id.toString()) {
        throw new Error('Không thể follow chính mình');
      }
      return true;
    })
];
