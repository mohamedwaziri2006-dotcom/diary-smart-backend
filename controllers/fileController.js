const Diary = require('../models/Diary');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const r2Client = require('../config/r2'); // Hakikisha faili lako la r2.js linatumia S3Client na limewekwa region: 'auto'

const addDiaryEntry = async (req, res) => {
  try {
    const { title, content, details, mood, date } = req.body;
    let fileUrl = '';

    // 1. Kama mtumiaji amepakia faili jipya, lipakie kwenda Cloudflare R2
    if (req.file) {
      const userId = req.user ? (req.user.id || req.user._id) : (req.body.userId || 'guest');
      const uniqueFileName = `users/${userId}/${Date.now()}-${req.file.originalname}`;
      
      const uploadParams = {
        Bucket: process.env.R2_BUCKET_NAME,
        Key: uniqueFileName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      const command = new PutObjectCommand(uploadParams);
      await r2Client.send(command);

      fileUrl = `https://pub-af5cc6f5458d4f00be2878c9551752d0.r2.dev/${uniqueFileName}`;
    }

    const activeUserId = req.user ? (req.user.id || req.user._id) : req.body.userId;

    if (!activeUserId) {
      return res.status(400).json({ success: false, message: 'Kitambulisho cha mtumiaji (userId) kinahitajika.' });
    }

    // 2. Angalia kama hii ni hatua ya kuhariri (Update kupitia PUT /update/:id)
    const entryId = req.params.id;

    if (entryId) {
      // Tafuta diary ya zamani
      const existingEntry = await Diary.findById(entryId);
      if (!existingEntry) {
        return res.status(404).json({ success: false, message: 'Diary haijapatikana.' });
      }

      // Kama hakuna faili jipya lililowekwa, tumia faili la zamani lilelile
      const finalFileUrl = fileUrl ? fileUrl : existingEntry.fileUrl;

      existingEntry.title = title || existingEntry.title;
      existingEntry.content = content || details || existingEntry.content;
      existingEntry.details = details || content || existingEntry.details;
      existingEntry.mood = mood || existingEntry.mood;
      existingEntry.date = date || existingEntry.date;
      existingEntry.fileUrl = finalFileUrl;

      await existingEntry.save();

      return res.status(200).json({
        success: true,
        message: 'Diary imesasishwa kikamilifu!',
        data: existingEntry
      });
    }

    // 3. Kama siyo update, tengeneza diary mpya kabisa (POST /upload)
    const newDiary = new Diary({
      userId: activeUserId,
      title,
      content: content || details || '',
      details: details || content || '',
      mood: mood || 'Happy',
      date: date || new Date().toISOString().split('T')[0],
      fileUrl: fileUrl
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