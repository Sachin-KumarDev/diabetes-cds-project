const express = require('express');

const router = express.Router();

const { auth, authorize } = require('../middleware/auth');

const {
  validate,
  validatePrediction
} = require('../middleware/validation');

const {
  createPrediction,
  getPredictionById,
  getPatientPredictions,
  getAllPredictions,
  updatePrediction
} = require('../controllers/predictionController');

// All routes require authentication
router.use(auth);

// Only doctors can create predictions
router.post(
  '/',
  authorize('doctor'),
  validate(validatePrediction),
  createPrediction
);

// Authenticated users can read predictions for now
router.get('/', getAllPredictions);

router.get('/patient/:patientId', getPatientPredictions);

router.get('/:id', getPredictionById);

// Only doctors can update doctor notes
router.put(
  '/:id',
  authorize('doctor'),
  updatePrediction
);

module.exports = router;

