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
    req.userId = decoded.id || decoded._id;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Token si sahihi au imeisha muda' });
  }
};

// 1. KUHIFADHI DIARY MPYA (POST: /api/diary/add)
router.post('/add', auth, async (req, res) => {
  try {
    const { title, date, mood, details, content } = req.body;
    
    if (!title || (!details && !content)) {
      return res.status(400).json({ message: 'Tafadhali jaza kichwa cha habari na maelezo.' });
    }

    const newDiary = new Diary({
      userId: req.userId,
      title,
      date: date || new Date(),
      mood: mood || 'Happy',
      details: details || content
    });

    await newDiary.save();
    res.status(201).json({ message: 'Diary imehifadhiwa kikamilifu!', diary: newDiary });
  } catch (error) {
    console.error('Add Diary Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 2. KUSOMA DIARY ZOTE ZA MTUMIAJI (GET: /api/diary/my-entries)
router.get('/my-entries', auth, async (req, res) => {
  try {
    const entries = await Diary.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(entries);
  } catch (error) {
    console.error('Fetch Diaries Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 3. UPDATE DIARY ENTRY (PUT: /api/diary/update/:id)
router.put('/update/:id', auth, async (req, res) => {
  try {
    const { title, date, mood, details, content } = req.body;
    
    const updatedEntry = await Diary.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title, date, mood, details: details || content },
      { new: true }
    );

    if (!updatedEntry) {
      return res.status(404).json({ message: 'Diary entry haipatikani au huna ruhusa' });
    }

    res.json({ message: 'Imesasishwa kikamilifu!', updatedEntry });
  } catch (error) {
    console.error('Update Diary Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 4. DELETE DIARY ENTRY (DELETE: /api/diary/delete/:id)
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    const deletedEntry = await Diary.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!deletedEntry) {
      return res.status(404).json({ message: 'Diary entry haipatikani au huna ruhusa' });
    }

    res.json({ message: 'Imefutwa kikamilifu!' });
  } catch (error) {
    console.error('Delete Diary Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;