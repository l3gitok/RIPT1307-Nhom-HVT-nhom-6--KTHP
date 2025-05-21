const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const upload = require('../middlewares/upload.middleware');
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/', verifyToken, upload.single('image'), uploadController.uploadImage);

module.exports = router;
