const { PutObjectCommand } = require('@aws-sdk/client-s3');
const r2Client = require('../config/r2'); // Inachukua usanidi ulioutengeneza awali

const uploadFileToR2 = async (req, res) => {
  try {
    // 1. Angalia kama faili limetumwa
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Tafadhali chagua faili la kupakia.' });
    }

    // 2. Tengeneza jina la kipekee la faili ili lisije kujirudia (kwa mfano: users/userId/timestamp-filename)
    const userId = req.user ? req.user.id : 'guest';
    const uniqueFileName = `users/${userId}/${Date.now()}-${req.file.originalname}`;

    // 3. Weka vigezo vya kupakia kwenda Cloudflare R2
    const uploadParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: uniqueFileName,
      Body: req.file.buffer, // Inachukua data kutoka kwenye memory ya multer
      ContentType: req.file.mimetype, // Inatambua kama ni image/jpeg, application/pdf, n.k.
    };

    // 4. Tekeleza kitendo cha kupakia kupitia S3Client
    const command = new PutObjectCommand(uploadParams);
    await r2Client.send(command);

    // 5. Tengeneza kiungo (URL) cha faili kilipohifadhiwa
    // Kumbuka: Hakikisha umeweka Public R2.dev domain kwenye bucket yako au tumia Presigned URL kama unataka usalama mkubwa
    const fileUrl = `https://pub-xxxxxx.r2.dev/${uniqueFileName}`; 
    // *Badilisha hiyo pub-xxxxxx iwe r2.dev domain halisi ya bucket yako au hifadhi tu uniqueFileName kwenye MongoDB*

    return res.status(200).json({
      success: true,
      message: 'Faili limepakia kwa mafanikio kwenda Cloudflare R2!',
      fileUrl: fileUrl,
      fileName: uniqueFileName
    });

  } catch (error) {
    console.error('Hitilafu wakati wa kupakia faili R2:', error);
    return res.status(500).json({ success: false, message: 'Imeshindikana kupakia faili.', error: error.message });
  }
};

module.exports = { uploadFileToR2 };