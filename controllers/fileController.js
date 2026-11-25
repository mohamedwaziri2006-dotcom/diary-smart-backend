const Diary = require('../models/Diary');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const r2Client = require('../config/r2'); // Usanidi wako wa Cloudflare R2

const addDiaryEntry = async (req, res) => {
  try {
    const { title, content, details, mood, date } = req.body;
    let fileUrl = '';

    // 1. Kama mtumiaji amepakia faili, lipakie kwenda Cloudflare R2 kwanza
    if (req.file) {
      const userId = req.user ? (req.user.id || req.user._id) : (req.body.userId || 'guest');
      const uniqueFileName = `users/${userId}/${Date.now()}-${req.file.originalname}`;
      
      const uploadParams = {
        Bucket: process.env.R2_BUCKET_NAME,
        Key: uniqueFileName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      // Tekeleza upakiaji kwenda R2
      const command = new PutObjectCommand(uploadParams);
      await r2Client.send(command);

      // Tengeneza link kamili ya faili litakalohifadhiwa kwenye database
      fileUrl = `https://pub-af5cc6f5458d4f00be2878c9551752d0.r2.dev/${uniqueFileName}`;
    }

    // 2. Chagua userId kwa usalama kutoka kwa mtumiaji aliyelogin
    const activeUserId = req.user ? (req.user.id || req.user._id) : req.body.userId;

    if (!activeUserId) {
      return res.status(400).json({ success: false, message: 'Kitambulisho cha mtumiaji (userId) kinahitajika.' });
    }

    // 3. Tengeneza na uhifadhi kumbukumbu mpya kwenye MongoDB
    const newDiary = new Diary({
      userId: activeUserId,
      title,
      content: content || details || '', // Inasaidia kama sehemu ya mbele inatuma content au details
      details: details || content || '',
      mood: mood || 'Happy',
      date: date || new Date().toISOString().split('T')[0],
      fileUrl: fileUrl // Hapa inakaa link ya R2 kama faili lipo, au inabaki tupu
    });

    await newDiary.save();

    return res.status(201).json({
      success: true,
      message: 'Diary imehifadhiwa kikamilifu na faili lake!',
      data: newDiary
    });

  } catch (error) {
    console.error('Hitilafu wakati wa kusave diary:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Imeshindikana kusave kumbukumbu.', 
      error: error.message 
    });
  }
};

module.exports = { addDiaryEntry };