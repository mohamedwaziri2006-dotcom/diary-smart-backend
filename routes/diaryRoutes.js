const express = require('express');
const router = express.Router();
const multer = require('multer');
// Hakikisha jina hili la faili linasomeka sawa na lilivyo kwenye folda yako ya controllers (fileController au fileControllers)
const { uploadFileToR2 } = require('../controllers/fileControllers'); 
const verifyToken = require('../middleware/authMiddleware'); // Middleware ya kulinda routes

// Weka multer itumie memoryStorage ili isitunze faili kwenye diski ya seva (kuzuia kujaa kwa 512MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // Kikomo cha 10MB
});

// Route ya kupakia faili (mfano: picha au PDF ya diary)
router.post('/upload', verifyToken, upload.single('file'), uploadFileToR2);

module.exports = router;