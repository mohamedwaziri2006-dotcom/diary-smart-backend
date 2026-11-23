const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// --- 1. MIDDLEWARE YA KUHAKIKI TOKEN (VERIFY TOKEN) ---
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Hakuna token, ruhusa imekataliwa' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  if (!token) {
    return res.status(401).json({ message: 'Fomati ya token si sahihi' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Inatoa { id: user._id }
    next();
  } catch (err) {
    res.status(403).json({ message: 'Token si sahihi au imeisha muda wake' });
  }
};

// --- 2. KUJISAJILI (REGISTER) ---
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Barua pepe hii tayari imesajiliwa' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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

// --- 3. KUINGIA (LOGIN) ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Taarifa ulizoingiza si sahihi' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Taarifa ulizoingiza si sahihi' });
    }

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

// --- 4. PATA TAARIFA ZA MTUMIAJI ALIYELOGIN (Kwa ajili ya Settings Page) ---
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Mtumiaji hapatikani' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- 5. BADILISHA TAARIFA / PASSWORD (Kwa ajili ya Settings Page) ---
router.put('/update-profile', verifyToken, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Mtumiaji hapatikani' });
    }

    if (username) user.username = username;
    if (email) user.email = email;

    // Kama amejaza nenosiri jipya, lifiche kwanza
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({ 
      message: 'Mabadiliko yamehifadhiwa kikamilifu!', 
      user: { username: user.username, email: user.email } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Tunatuma router pamoja na verifyToken
router.verifyToken = verifyToken;
module.exports = router;
// --- 6. FORGOT PASSWORD ---
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Angalia kama email ipo kwenye database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Barua pepe hii haijasajiliwa kwenye mfumo.' });
    }

    // Hapa unaweza kutengeneza token ya ziada au kutuma email
    // Kwa sasa tunatoa jibu la mafanikio kwamba maelekezo yametumwa
    res.json({ message: 'Maelekezo ya kubadilisha nenosiri yametumwa kwenye barua pepe yako.' });

  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// 3. KUBADILI / KWEKA NENOSIRI JIPYA (RESET PASSWORD)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Mtumiaji hajapatikana!' });
    }

    // Fanya nenosiri jipya liwe la siri (Hash password)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Sasisha nenosiri kwenye database
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Nenosiri limebadilishwa kwa mafanikio!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});