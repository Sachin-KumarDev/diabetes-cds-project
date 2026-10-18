
const express = require('express');
const router = express.Router();

const { auth, authorize } = require('../middleware/auth');
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

// All authenticated roles can view patients
router.get('/', getAllPatients);
router.get('/patientId/:patientId', getPatientByPatientId);
router.get('/:id', getPatientById);

// Doctor and Admin can register patients
router.post(
  '/',
  authorize('doctor', 'admin'),
  validate(validatePatient),
  createPatient
);

// Only Doctor and Admin can update patient details
router.put(
  '/:id',
  authorize('doctor', 'admin'),
  validate(validatePatient),
  updatePatient
);

// Only Admin can delete patients
router.delete('/:id', authorize('admin'), deletePatient);

module.exports = router;