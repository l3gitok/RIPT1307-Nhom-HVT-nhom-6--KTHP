const gameService = require('../services/game.service');

exports.createGame = async (req, res, next) => {
  try {
    const game = await gameService.createGame(req.body, req.user.id);
    res.status(201).json(game);
  } catch (err) {
    next(err);
  }
};

exports.getAllGames = async (req, res, next) => {
  try {
    const games = await gameService.getAllGames();
    res.json(games);
  } catch (err) {
    next(err);
  }
};
