const express = require('express');
const {
  startInspection,
  saveDamages,
  endInspection,
  getInspectionHistory,
  getInspectionDetail
} = require('../controllers/inspectionController');

const router = express.Router();

router.post('/new', startInspection);
router.post('/detected', saveDamages);
router.post('/end', endInspection);
router.get('/history', getInspectionHistory);
router.get('/detail/:id', getInspectionDetail);

module.exports = router;
