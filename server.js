const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// 1. Anzisha app kwanza kabisa kabla ya kuitumia kwenye routes zozote
const app = express();

// Middleware ya jumla
app.use(express.json());
app.use(cors());

// 2. Kuagiza Routes zote (Njia za Auth, Diary, na Goals)
const authRoutes = require('./routes/auth');
const diaryRoutes = require('./routes/diaryRoutes'); // Hakikisha jina la faili hapa linaendana na la kwako
const goalsRoutes = require('./routes/goals');

// 3. Ruhusu mafaili maalum ya static yatoshee moja kwa moja bila kupitia index.html
app.use(express.static(path.join(__dirname), {
  index: false // Inazuia server kutoa index.html kiotomatiki kama ikishindwa kupata faili fulani
}));

// 4. Kuunganisha Database ya MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Database ya MongoDB imejiunga kikamilifu!'))
  .catch((err) => console.error('❌ Tatizo la kuunganisha Database:', err));

// 5. Njia za API (API Endpoints)
app.use('/api/auth', authRoutes);
app.use('/api/diary', diaryRoutes);
app.use('/api/goals', goalsRoutes);

// Test Route ya API
app.get('/api/status', (req, res) => {
  res.send('API ya DIARY SMART ipo hewani na inafanya kazi!');
});

// 6. Njia ya kurudisha index.html kwa kutumia Regular Expression
app.get(/.*/, (req, res, next) => {
  // Kama ombi linahusu picha, sitemap (xml), au api, lisipelekwe kwenye index.html
  if (req.path.endsWith('.png') || req.path.endsWith('.xml') || req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Kuendesha Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server inakimbia kwenye port ${PORT}`);
});