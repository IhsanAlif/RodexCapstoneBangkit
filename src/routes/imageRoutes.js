const express = require('express');
const multer = require('multer');
const router = express.Router();
const imageController = require('../controllers/imageController');

// Set up multer for handling multipart/form-data
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), imageController.uploadAndProcessImage);

module.exports = router;
