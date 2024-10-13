const express = require('express');
const multer = require('multer');
const { uploadCsv, checkStatus } = require('../controllers/imageController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });  // Configure multer

router.post('/upload', upload.single('csvFile'), uploadCsv);
router.get('/status/:id', checkStatus);

module.exports = router;
