const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  review_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', required: true },
  author_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);
