const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { validate, validatePatient } = require('../middleware/validation');
const {
  getAllPatients,
  getPatientById,
  getPatientByPatientId,
  createPatient,
  updatePatient,
  deletePatient
} = require('../controllers/patientController');

// All routes require authentication
router.use(auth);

// Routes
router.get('/', getAllPatients);
router.get('/patientId/:patientId', getPatientByPatientId);
router.post('/', validate(validatePatient), createPatient);
router.get('/:id', getPatientById);
router.put('/:id', validate(validatePatient), updatePatient);
router.delete('/:id', deletePatient);

module.exports = router;