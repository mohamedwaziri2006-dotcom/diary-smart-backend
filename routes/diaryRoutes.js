const express = require('express');
const router = express.Router();
const multer = require('multer');

// 1. Agiza Controllers na Middleware kwa usahihi
const { addDiaryEntry } = require('../controllers/fileController'); 
const verifyToken = require('../middleware/auth');

// 2. Weka multer itumie memoryStorage kwanza kabla ya kuitumia kwenye routes
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // Kikomo cha 10MB
});

// 3. Route ya ziada ya /add (fallback) ikitumia verifyToken
router.post('/add', verifyToken, upload.single('file'), addDiaryEntry);

// 4. Route ya kupakia faili na kuhifadhi diary mpya kwa pamoja
router.post('/upload', verifyToken, upload.single('file'), addDiaryEntry);

// 5. Route ya kusasisha diary
router.put('/update/:id', verifyToken, upload.single('file'), addDiaryEntry);

module.exports = router;