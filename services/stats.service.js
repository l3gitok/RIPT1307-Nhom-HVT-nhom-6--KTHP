// services/stats.service.js
const Game = require('../models/game.model');
const Review = require('../models/review.model');
const User = require('../models/user.model');

exports.getOverallStats = async () => {
  const [totalGames, totalReviews, totalUsers, approvedReviews] = await Promise.all([
    Game.countDocuments({ approved: true }),
    Review.countDocuments(),
    User.countDocuments(),
    Review.countDocuments({ status: 'approved' })
  ]);
  
  return {
    totalGames,
    totalReviews,
    totalUsers,
    approvedReviews
  };
};