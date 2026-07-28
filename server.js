const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Kuagiza Routes (Njia za Auth na Diary)
const authRoutes = require('./routes/auth');
const diaryRoutes = require('./routes/diary');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Hii inaiambia Server ikubali kusoma mafaili yote ya Frontend (HTML, CSS, JS) kwa usahihi kupitia path kamili
app.use(express.static(path.join(__dirname)));

// Kuunganisha Database ya MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Database ya MongoDB imejiunga kikamilifu!'))
  .catch((err) => console.error('❌ Tatizo la kuunganisha Database:', err));

// Njia za API (API Endpoints)
app.use('/api/auth', authRoutes);
app.use('/api/diary', diaryRoutes);

// Test Route ya API
app.get('/api/status', (req, res) => {
  res.send('API ya DIARY SMART ipo hewani na inafanya kazi!');
});

// Njia ya mwisho kabisa kwa ajili ya kusoma index.html na kuruhusu page zote za frontend zifunguke
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Kuendesha Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server inakimbia kwenye port ${PORT}`);
});