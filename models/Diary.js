const mongoose = require('mongoose');

const DiarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  details: {
    type: String,
    default: ''
  },
  mood: {
    type: String,
    default: 'Happy'
  },
  date: {
    type: String,
    required: true
  },
  // Uwanja huu unahifadhi link ya faili (Picha au PDF) kutoka Cloudflare R2
  fileUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true // Huongeza moja kwa moja createdAt na updatedAt
});

module.exports = mongoose.model('Diary', DiarySchema);