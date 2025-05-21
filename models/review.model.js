const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  game_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
  author_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  images: [String],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  created_at: { type: Date, default: Date.now },
  updated_at: Date
});

module.exports = mongoose.model('Review', reviewSchema);
