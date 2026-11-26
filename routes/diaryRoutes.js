const express = require('express');
const router = express.Router();
const multer = require('multer');

// Hakikisha jina la faili hapa linafanana sawia na lililopo kwenye folda ya controllers
const { addDiaryEntry } = require('../controllers/fileController'); 
const verifyToken = require('../middleware/auth');

// Weka multer itumie memoryStorage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // Kikomo cha 10MB
});

// Route ya kupakia faili na kuhifadhi diary mpya kwa pamoja
router.post('/upload', verifyToken, upload.single('file'), addDiaryEntry);

// Route ya kusasisha diary
router.put('/update/:id', verifyToken, upload.single('file'), addDiaryEntry);

module.exports = router;