const express = require('express');
const router = express.Router();
const gameController = require('../controllers/game.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.get('/', gameController.getAllGames);
router.post('/', verifyToken, requireRole('admin'), gameController.createGame);

module.exports = router;
