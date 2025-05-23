const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['Game', 'Review', 'Comment'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  reaction: { type: String, enum: ['like', 'dislike', 'love', 'haha', 'angry'], default: 'like' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Like', likeSchema);