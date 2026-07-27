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
    type: String,
    required: true
  },
  mood: {
    type: String,
    default: 'Happy'
  },
  date: {
    type: String
  }
});

module.exports = mongoose.model('Diary', DiarySchema);