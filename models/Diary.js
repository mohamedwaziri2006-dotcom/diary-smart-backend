const mongoose = require('mongoose');

const DiarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: false
  },
  details: {
    type: String
  },
  mood: {
    type: String,
    default: 'Happy'
  },
  date: {
    type: String
  },
  // Uwanja huu mpya unahifadhi link ya faili (Picha au PDF) kutoka Cloudflare R2
  fileUrl: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('Diary', DiarySchema);