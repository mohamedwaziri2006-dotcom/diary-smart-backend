const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Kuunganisha na MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Imeunganishwa Kikamilifu!'))
  .catch((err) => console.error('❌ Hitilafu kwenye kuunganisha MongoDB:', err));

// Njia ya Awali (Test Route)
app.get('/', (req, res) => {
  res.json({ message: 'DIARY SMART API inafanya kazi vizuri!' });
});

// Kuwasha Seva (Start Server)
app.listen(PORT, () => {
  console.log(`🚀 Seva inasikiliza kwenye bandari (port) ${PORT}`);
});