const express = require('express');
const router = express.Router();
const multer = require('multer');

// Tumia addDiaryEntry kama ilivyo kwenye fileController.js yako
const { addDiaryEntry } = require('../controllers/fileController'); 
const verifyToken = require('../middleware/authMiddleware'); // Middleware ya kulinda routes

// Weka multer itumie memoryStorage ili isitunze faili kwenye diski ya seva (kuzuia kujaa kwa 512MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // Kikomo cha 10MB
});

// Route ya kupakia faili na kuhifadhi diary kwa pamoja
router.post('/upload', verifyToken, upload.single('file'), addDiaryEntry);

module.exports = router;