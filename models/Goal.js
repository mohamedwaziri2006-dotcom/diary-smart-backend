const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true // Inasaidia MongoDB kutafuta goals za mtumiaji haraka zaidi
  },
  title: { 
    type: String, 
    required: [true, 'Tafadhali weka jina la goal'], 
    trim: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  details: { 
    type: String, 
    default: '',
    trim: true 
  },
  completed: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

module.exports = mongoose.model('Goal', GoalSchema);