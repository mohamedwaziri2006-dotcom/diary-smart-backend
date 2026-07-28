const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');

// 1. Add New Goal
router.post('/add', async (req, res) => {
  try {
    const { userId, title, date, details } = req.body;
    const newGoal = new Goal({ userId, title, date, details });
    const savedGoal = await newGoal.save();
    res.status(201).json(savedGoal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Get User Goals
router.get('/my-goals', async (req, res) => {
  try {
    // Kama unatumia auth middleware kuweka req.user, unaweza kuibadilisha hapa, au tumia userId kutoka query/headers
    // Kwa urahisi kulingana na frontend yako inayotuma token, unaweza kuchuja kwa user aliyelogin:
    const goals = await Goal.find(); // Unaweza kuboresha ikamata ya user husika
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Update Goal (Edit / Complete Tick)
router.put('/update/:id', async (req, res) => {
  try {
    const updatedGoal = await Goal.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(updatedGoal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Delete Goal
router.delete('/delete/:id', async (req, res) => {
  try {
    await Goal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Goal deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;