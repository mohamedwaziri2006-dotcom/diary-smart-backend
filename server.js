const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Kuagiza Routes (Njia za Auth na Diary)
const authRoutes = require('./routes/auth');
const diaryRoutes = require('./routes/diary');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Hii inaiambia Server ikubali kusoma mafaili ya Frontend (HTML, CSS, JS) moja kwa moja
app.use(express.static(__dirname));

// Kuunganisha Database ya MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Database ya MongoDB imejiunga kikamilifu!'))
  .catch((err) => console.error('❌ Tatizo la kuunganisha Database:', err));

// Njia za API (API Endpoints)
app.use('/api/auth', authRoutes);
app.use('/api/diary', diaryRoutes);

// Kama unataka kuacha test route lakini isizuie index.html, iweke kwenye kiambishi tamati tofauti au iondoe kabisa
app.get('/api/status', (req, res) => {
  res.send('API ya DIARY SMART ipo hewani na inafanya kazi!');
});

// Kuendesha Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server inakimbia kwenye port ${PORT}`);
});