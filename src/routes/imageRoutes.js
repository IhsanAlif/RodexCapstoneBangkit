const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');

router.post('/upload', imageController.uploadAndProcessImage);

// Route to get and list all damages
router.get('/damages', imageController.getAllDamages);

// Route to get a single damage by ID
router.get('/damages/:id', imageController.getDamageById);

// Route to get a damages by inspection_id
router.get('/inspection-damages/:inspectionId', imageController.getDamagesByInspectionId);

module.exports = router;
