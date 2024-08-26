const express = require('express');
const multer = require('multer');
const router = express.Router();
const imageController = require('../controllers/imageController');

// Set up multer for handling multipart/form-data
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), imageController.uploadAndProcessImage);

// Route to get and list all damages
router.get('/damages', imageController.getAllDamages);

// Route to get a single damage by ID
router.get('/damages/:id', imageController.getDamageById);

module.exports = router;
