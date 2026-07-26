const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1. KUJISAJILI (REGISTER)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Angalia kama mtumiaji tayari yupo
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Barua pepe hii tayari imesajiliwa' });
    }

    // Ficha Nenosiri (Hash password)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Hifadhi mtumiaji mpya
    user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();
    res.status(201).json({ message: 'Akaunti imetengenezwa kikamilifu!' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 2. KUINGIA (LOGIN)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Hakiki kama email ipo
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Taarifa ulizoingiza si sahihi' });
    }

    // Hakiki password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Taarifa ulizoingiza si sahihi' });
    }

    // Tengeneza Token (JWT)
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;