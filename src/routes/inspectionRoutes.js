const express = require('express');
const router = express.Router();
const inspectionController = require('../controllers/inspectionController');

router.post('/new', inspectionController.startInspection);
router.post('/end', inspectionController.endInspection);
router.get('/history', inspectionController.getInspectionHistory);
router.get('/detail/:id', inspectionController.getInspectionDetail);

module.exports = router;
