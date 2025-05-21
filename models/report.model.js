const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  target_type: { type: String, enum: ['user', 'review'], required: true },
  target_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  reporter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  handled: { type: Boolean, default: false },
  action: {
    type: {
      type: String,
      enum: ['ban']
    },
    days: Number
  },
  handled_at: Date
});

module.exports = mongoose.model('Report', reportSchema);
