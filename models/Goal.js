const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  date: { type: Date, default: Date.now },
  details: { type: String, default: '' },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Goal', GoalSchema);