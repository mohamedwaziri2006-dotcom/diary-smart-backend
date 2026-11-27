const express = require('express');
const router = express.Router();
const multer = require('multer');

// Rekebisha njia (path) hapa kutoka '../controllers/fileController' iwe sahihi kulingana na muundo wako
const { addDiaryEntry } = require('../controllers/fileController'); 
const verifyToken = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // Kikomo cha 10MB
});

router.post('/add', verifyToken, upload.single('file'), addDiaryEntry);
router.post('/upload', verifyToken, upload.single('file'), addDiaryEntry);
router.put('/update/:id', verifyToken, upload.single('file'), addDiaryEntry);

module.exports = router;