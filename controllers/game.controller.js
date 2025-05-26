const gameService = require('../services/game.service');

// Tạo game mới
exports.createGame = async (req, res) => {
  try {
    const game = await gameService.createGame(req.body, req.user._id);
    res.status(201).json({
      status: 'success',
      data: game
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Lấy tất cả game
exports.getAllGames = async (req, res) => {
  try {
    const { page, limit, search, genre, platform } = req.query;
    const result = await gameService.getAllGames({ 
      page: parseInt(page), 
      limit: parseInt(limit), 
      search, 
      genre, 
      platform 
    });
    
    res.status(200).json({
      status: 'success',
      data: result.games,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Lấy game theo ID
exports.getGameById = async (req, res) => {
  try {
    const game = await gameService.getGameById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: game
    });
  } catch (error) {
    res.status(404).json({
      status: 'error',
      message: error.message
    });
  }
};

// Lấy game theo slug
exports.getGameBySlug = async (req, res) => {
  try {
    const game = await gameService.getGameBySlug(req.params.slug);
    res.status(200).json({
      status: 'success',
      data: game
    });
  } catch (error) {
    res.status(404).json({
      status: 'error',
      message: error.message
    });
  }
};

// Cập nhật game
exports.updateGame = async (req, res) => {
  try {
    const game = await gameService.updateGame(
      req.params.id,
      req.body,
      req.user._id
    );
    res.status(200).json({
      status: 'success',
      data: game
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Xóa game
exports.deleteGame = async (req, res) => {
  try {
    await gameService.deleteGame(req.params.id, req.user._id);
    res.status(200).json({
      status: 'success',
      message: 'Game deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Phê duyệt game (chỉ admin)
exports.approveGame = async (req, res) => {
  try {
    const game = await gameService.approveGame(req.params.id);
    res.status(200).json({
      status: 'success',
      data: game
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Lấy game theo thể loại
exports.getGamesByGenre = async (req, res) => {
  try {
    const games = await gameService.getGamesByGenre(req.params.genre);
    res.status(200).json({
      status: 'success',
      data: games
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Lấy game theo nền tảng
exports.getGamesByPlatform = async (req, res) => {
  try {
    const games = await gameService.getGamesByPlatform(req.params.platform);
    res.status(200).json({
      status: 'success',
      data: games
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

