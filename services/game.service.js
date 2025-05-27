const Game = require('../models/game.model');
const slugify = require('slugify');

exports.createGame = async (gameData, userId) => {
  const slug = slugify(gameData.title, { lower: true, strict: true });
  const existing = await Game.findOne({ slug });
  if (existing) throw new Error('Game already exists');

  const game = await Game.create({
    ...gameData,
    slug,
    created_by: userId,
    approved: false
  });

  return game;
};

exports.getAllGames = async ({ page = 1, limit = 10, search = '', genre = '', platform = '' }) => {
  const query = {};
  
  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }
  if (genre) {
    query.genres = genre;
  }
  if (platform) {
    query.platforms = platform;
  }

  const games = await Game.find(query)
    .sort({ created_at: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('created_by', 'username');

  const total = await Game.countDocuments(query);

  return {
    games,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

exports.getGameById = async (gameId) => {
  const game = await Game.findById(gameId)
    .populate('created_by', 'username');
  
  if (!game) throw new Error('Game not found');
  return game;
};

exports.getGameBySlug = async (slug) => {
  const game = await Game.findOne({ slug })
    .populate('created_by', 'username');
  
  if (!game) throw new Error('Game not found');
  return game;
};

exports.updateGame = async (gameId, updateData) => {
  const game = await Game.findById(gameId);
  if (!game) throw new Error('Game not found');

  if (updateData.title) {
    updateData.slug = slugify(updateData.title, { lower: true, strict: true });
  }

  const updatedGame = await Game.findByIdAndUpdate(
    gameId,
    { ...updateData, updated_at: new Date() },
    { new: true }
  ).populate('created_by', 'username');

  return updatedGame;
};

exports.deleteGame = async (gameId) => {
  const game = await Game.findById(gameId);
  if (!game) throw new Error('Game not found');
  await Game.findByIdAndDelete(gameId);
  return { message: 'Game deleted successfully' };
};

exports.approveGame = async (gameId) => {
  const game = await Game.findByIdAndUpdate(
    gameId,
    { approved: true },
    { new: true }
  );
  
  if (!game) throw new Error('Game not found');
  return game;
};

exports.getGamesByGenre = async (genre) => {
  // Chuyển đổi genre thành chữ hoa đầu tiên
  const formattedGenre = genre.charAt(0).toUpperCase() + genre.slice(1).toLowerCase();
  
  console.log('Searching for genre:', formattedGenre); // Debug log

  const games = await Game.find({ 
    genres: formattedGenre
  }).sort({ created_at: -1 });

  console.log('Found games:', games); // Debug log

  return games;
};

exports.getGamesByPlatform = async (platform) => {
  return Game.find({ 
    platforms: platform,
    approved: false
  }).sort({ created_at: -1 });
};
