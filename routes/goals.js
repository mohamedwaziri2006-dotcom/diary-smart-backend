const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');

// Hapa tunaita auth.js kisha tunachukua .verifyToken yake maalum
const authModule = require('./auth');
const verifyToken = authModule.verifyToken; 

// 1. Add New Goal
router.post('/add', verifyToken, async (req, res) => {
  try {
    console.log("USER DATA FROM TOKEN:", req.user);
    const { title, date, details } = req.body;
    
    const newGoal = new Goal({ 
      userId: req.user.id || req.user._id, 
      title, 
      date: date || Date.now(), 
      details: details || '' 
    });

    const savedGoal = await newGoal.save();
    res.status(201).json(savedGoal);
  } catch (err) {
    console.error("ERROR KUHIFADHI GOAL:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// 2. Get User Goals
router.get('/my-goals', verifyToken, async (req, res) => {
  try {
    console.log("USER ID KUPATA GOALS:", req.user);
    const userId = req.user.id || req.user._id;
    const goals = await Goal.find({ userId: userId }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    console.error("ERROR KUSOMA GOALS:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// 3. Update Goal
router.put('/update/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const updatedGoal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: userId },
      { $set: req.body },
      { new: true }
    );
    
    if (!updatedGoal) {
      return res.status(404).json({ message: 'Goal haipatikani au huna ruhusa' });
    }

    res.json(updatedGoal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Delete Goal
router.delete('/delete/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const deletedGoal = await Goal.findOneAndDelete({ _id: req.params.id, userId: userId });

    if (!deletedGoal) {
      return res.status(404).json({ message: 'Goal haipatikani au huna ruhusa' });
    }

    res.json({ message: 'Goal deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;