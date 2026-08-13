const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getPatientHistory,
  getHistorySummary,
  exportReport
} = require('../controllers/historyController');

// All routes require authentication
router.use(auth);

// Routes
router.get('/patient/:patientId', getPatientHistory);
router.get('/summary/:patientId', getHistorySummary);
router.get('/export/:patientId', exportReport);

module.exports = router;