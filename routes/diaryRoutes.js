const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadFileToR2 } = require('../controllers/fileController');
const verifyToken = require('../middleware/authMiddleware'); // Middleware yako ya kulinda routes

// Weka multer itumie memoryStorage ili isitunze faili kwenye diski ya seva (kuzuia kujaa kwa 512MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // Imeongezwa kutoka 5MB kwenda 10MB
});

// Route ya kupakia faili (mfano: picha au PDF ya diary)
router.post('/upload', verifyToken, upload.single('file'), uploadFileToR2);

module.exports = router;