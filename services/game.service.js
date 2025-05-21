const Game = require('../models/game.model');
const slugify = require('slugify');

exports.createGame = async ({ title, description, cover_url }, userId) => {
  const slug = slugify(title, { lower: true, strict: true });
  const existing = await Game.findOne({ slug });
  if (existing) throw new Error('Game already exists');

  const game = await Game.create({
    title,
    slug,
    description,
    cover_url,
    created_by: userId,
    approved: false
  });

  return game;
};

exports.getAllGames = async () => {
  return Game.find({ approved: true }).sort({ created_at: -1 });
};
