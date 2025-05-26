const express = require('express');
const router = express.Router();
const userReportController = require('../controllers/user-report.controller');
const userReportValidation = require('../middlewares/user-report.validation');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Protected routes (cần đăng nhập)
router.use(verifyToken);

// Report routes
router.post('/', userReportValidation.validateCreateReport, userReportController.createReport);
router.get('/status/:reportedUserId', userReportValidation.validateMongoId, userReportController.checkReportStatus);

// Admin only routes
router.get('/', isAdmin, userReportController.getReports);
router.get('/stats', isAdmin, userReportController.getReportStats);
router.patch('/:reportId/status', userReportValidation.validateUpdateReportStatus, isAdmin, userReportController.updateReportStatus);

module.exports = router; 