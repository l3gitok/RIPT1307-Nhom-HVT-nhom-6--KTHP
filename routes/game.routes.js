const express = require('express');
const router = express.Router();
const gameController = require('../controllers/game.controller');
const { verifyToken, isAdmin, isModerator, optionalAuth } = require('../middlewares/auth.middleware');
const { validateInput } = require('../middlewares/validate.middleware');

// Public routes - Không cần đăng nhập
router.get('/', optionalAuth, gameController.getAllGames);
router.get('/genre/:genre', optionalAuth, gameController.getGamesByGenre);
router.get('/platform/:platform', optionalAuth, gameController.getGamesByPlatform);
router.get('/:id', optionalAuth, gameController.getGameById);
router.get('/slug/:slug', optionalAuth, gameController.getGameBySlug);

// Protected routes - Cần đăng nhập
router.use(verifyToken);

// Routes cho người dùng đã đăng nhập
router.post('/', gameController.createGame);
router.patch('/:id', gameController.updateGame);
router.delete('/:id', gameController.deleteGame);

// Admin/Moderator routes
router.use(isAdmin);
router.patch('/:id/approve', gameController.approveGame);

module.exports = router;
