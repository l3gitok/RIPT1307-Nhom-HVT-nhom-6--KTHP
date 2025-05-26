const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  cover_url: { type: String },
  release_date: { type: Date },
  genres: [{ type: String }],
  platforms: [{ type: String }],
  rating: { type: Number, default: 0 },
  
  // ✅ BỔ SUNG các trường mới cho RAWG data
  metacritic: { type: Number }, // Điểm Metacritic
  esrb_rating: { type: String }, // Độ tuổi (E, T, M...)
  developer: [{ type: String }], // Nhà phát triển
  publisher: [{ type: String }], // Nhà phát hành
  rawg_id: { type: Number, unique: true }, // ID từ RAWG API
  slug: { type: String }, // Slug từ RAWG
  
  approved: { type: Boolean, default: false },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Game', gameSchema);
