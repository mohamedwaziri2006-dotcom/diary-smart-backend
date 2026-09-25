const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Kuagiza Routes (Njia za Auth, Diary, na Goals)
const authRoutes = require('./routes/auth');
const diaryRoutes = require('./routes/diary');
const goalsRoutes = require('./routes/goals');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// 1. Kusoma mafaili yote ya Static (HTML, CSS, JS, sw.js, manifest.json, na picha za icons)
app.use(express.static(path.join(__dirname)));

// 2. Kuunganisha Database ya MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Database ya MongoDB imejiunga kikamilifu!'))
  .catch((err) => console.error('❌ Tatizo la kuunganisha Database:', err));

// 3. Njia za API (API Endpoints)
app.use('/api/auth', authRoutes);
app.use('/api/diary', diaryRoutes);
app.use('/api/goals', goalsRoutes);

// Test Route ya API
app.get('/api/status', (req, res) => {
  res.send('API ya DIARY SMART ipo hewani na inafanya kazi!');
});

// 4. Njia ya kurudisha index.html kwa ajili ya Frontend routing (Iwekwe mwisho kabisa baada ya API na static files)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Kuendesha Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server inakimbia kwenye port ${PORT}`);
});