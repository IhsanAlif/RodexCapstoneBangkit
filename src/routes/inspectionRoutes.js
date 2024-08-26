const express = require('express');
const router = express.Router();
const inspectionController = require('../controllers/inspectionController');

router.post('/new', inspectionController.startInspection);
router.post('/end', inspectionController.endInspection);
router.get('/get', inspectionController.getInspectionHistory);
router.get('/get/:id', inspectionController.getInspectionDetail);

module.exports = router;
