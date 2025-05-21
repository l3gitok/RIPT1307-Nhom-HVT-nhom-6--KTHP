const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.post('/', verifyToken, reportController.createReport);
router.get('/pending', verifyToken, requireRole('admin'), reportController.getPendingReports);
router.patch('/:reportId/resolve', verifyToken, requireRole('admin'), reportController.resolveReport);

module.exports = router;
