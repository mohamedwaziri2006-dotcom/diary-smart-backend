const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
// Kwa sababu auth.js ipo ndani ya folda moja (routes), tunatumia ./auth
const verifyToken = require('./auth'); 

// 1. Add New Goal
router.post('/add', verifyToken, async (req, res) => {
  try {
    const { title, date, details } = req.body;
    
    const newGoal = new Goal({ 
      userId: req.user.id, // Inachukua ID halisi ya mtumiaji aliyelogin
      title, 
      date: date || Date.now(), 
      details: details || '' 
    });

    const savedGoal = await newGoal.save();
    res.status(201).json(savedGoal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Get User Goals (Inachuja na kuleta za mtumiaji aliyelogin pekee)
router.get('/my-goals', verifyToken, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Update Goal (Edit / Complete Tick)
router.put('/update/:id', verifyToken, async (req, res) => {
  try {
    const updatedGoal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
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
    const deletedGoal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!deletedGoal) {
      return res.status(404).json({ message: 'Goal haipatikani au huna ruhusa' });
    }

    res.json({ message: 'Goal deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;