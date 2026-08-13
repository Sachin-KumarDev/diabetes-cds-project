const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { validate, validatePrediction } = require('../middleware/validation');
const {
  createPrediction,
  getPredictionById,
  getPatientPredictions,
  getAllPredictions,
  updatePrediction
} = require('../controllers/predictionController');

// All routes require authentication
router.use(auth);

// Routes
router.post('/', validate(validatePrediction), createPrediction);
router.get('/', getAllPredictions);
router.get('/patient/:patientId', getPatientPredictions);
router.get('/:id', getPredictionById);
router.put('/:id', updatePrediction);

module.exports = router;