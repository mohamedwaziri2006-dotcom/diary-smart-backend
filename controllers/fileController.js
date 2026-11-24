const { PutObjectCommand } = require('@aws-sdk/client-s3');
const r2Client = require('../config/r2'); // Inachukua usanidi wako wa r2.js

const uploadFileToR2 = async (req, res) => {
  try {
    // 1. Angalia kama faili limetumwa
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tafadhali chagua faili la kupakia.' 
      });
    }

    // 2. Pata ID ya mtumiaji kwa usalama (kutoka req.user au req.body)
    const userId = req.user ? (req.user.id || req.user._id) : (req.body.userId || 'guest');
    
    // 3. Tengeneza jina la kipekee la faili
    const uniqueFileName = `users/${userId}/${Date.now()}-${req.file.originalname}`;

    // 4. Weka vigezo vya kupakia kwenda Cloudflare R2
    const uploadParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: uniqueFileName,
      Body: req.file.buffer, // Inachukua data kutoka kwenye memory ya multer
      ContentType: req.file.mimetype, // Inatambua aina ya faili (image/jpeg, application/pdf, n.k.)
    };

    // 5. Tekeleza kitendo cha kupakia kupitia S3Client
    const command = new PutObjectCommand(uploadParams);
    await r2Client.send(command);

    // 6. Tengeneza kiungo (URL) kamili cha faili kutumia domain yako halisi ya R2
    const fileUrl = `https://pub-af5cc6f5458d4f00be2878c9551752d0.r2.dev/${uniqueFileName}`; 

    return res.status(200).json({
      success: true,
      message: 'Faili limepakia kwa mafanikio kwenda Cloudflare R2!',
      fileUrl: fileUrl,
      fileName: uniqueFileName
    });

  } catch (error) {
    console.error('Hitilafu wakati wa kupakia faili R2:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Imeshindikana kupakia faili.', 
      error: error.message 
    });
  }
};

module.exports = { uploadFileToR2 };