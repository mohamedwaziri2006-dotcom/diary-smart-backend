const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Diary = require('../models/Diary');

// Middleware ya kuhakiki kama mtumiaji ameingia (Auth Middleware)
const auth = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Huna ruhusa, tafadhali ingia kwanza' });

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Token si sahihi' });
  }
};

// 1. KUHIFADHI DIARY MPYA
router.post('/add', auth, async (req, res) => {
  try {
    const { title, date, mood, details, content } = req.body;
    
    const newDiary = new Diary({
      userId: req.userId,
      title,
      date,
      mood: mood || 'Happy',
      details: details || content
    });

    await newDiary.save();
    res.status(201).json({ message: 'Diary imehifadhiwa kikamilifu!', diary: newDiary });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 2. KUSOMA DIARY ZOTE ZA MTUMIAJI
router.get('/my-entries', auth, async (req, res) => {
  try {
    const entries = await Diary.find({ userId: req.userId }).sort({ date: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 3. KUFUTA DIARY
router.delete('/:id', auth, async (req, res) => {
  try {
    await Diary.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Diary imefutwa kikamilifu' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;