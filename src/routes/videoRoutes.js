const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

router.post('/upload', videoController.uploadAndProcessVideo);

module.exports = router;
