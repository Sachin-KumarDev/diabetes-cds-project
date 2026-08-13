const Patient = require('../models/Patient');
const Prediction = require('../models/Prediction');
const mlClient = require('../services/mlClient');

// Create prediction
const createPrediction = async (req, res) => {
  try {
    const patientData = req.body;
    
    // Check if patient exists
    let patient = await Patient.findOne({
      where: { patientId: patientData.patientId }
    });

    if (!patient) {
      // Create new patient
      patient = await Patient.create({
        patientId: patientData.patientId,
        name: patientData.name,
        age: patientData.age,
        gender: patientData.gender,
        contactNumber: patientData.contactNumber,
        email: patientData.email,
        address: patientData.address,
        medicalHistory: patientData.medicalHistory,
        createdBy: req.userId
      });
    }

    // Call ML service
    const mlResult = await mlClient.predict(patientData);

    if (!mlResult.success) {
      return res.status(500).json({
        success: false,
        message: mlResult.error || 'Prediction failed'
      });
    }

    // Save prediction
    const prediction = await Prediction.create({
      patientId: patient.id,
      gender: patientData.gender,
      age: patientData.age,
      hypertension: patientData.hypertension,
      heartDisease: patientData.heartDisease,
      smokingHistory: patientData.smokingHistory,
      bmi: patientData.bmi,
      hba1c: patientData.hba1c,
      bloodGlucose: patientData.bloodGlucose,
      prediction: mlResult.prediction,
      probability: mlResult.probability,
      riskLevel: mlResult.riskLevel,
      confidence: mlResult.confidence,
      doctorNotes: patientData.doctorNotes || null,
      createdBy: req.userId
    });

    res.json({
      success: true,
      data: {
        predictionId: prediction.id,
        patientId: patient.patientId,
        patientName: patient.name,
        prediction: mlResult.prediction,
        probability: mlResult.probability,
        riskLevel: mlResult.riskLevel,
        confidence: mlResult.confidence,
        createdAt: prediction.createdAt
      }
    });

  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get prediction by ID
const getPredictionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const prediction = await Prediction.findByPk(id, {
      include: [
        { model: Patient, attributes: ['patientId', 'name', 'age', 'gender'] }
      ]
    });

    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: 'Prediction not found'
      });
    }

    res.json({
      success: true,
      data: prediction
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get patient predictions
const getPatientPredictions = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const patient = await Patient.findOne({
      where: { patientId }
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const predictions = await Prediction.findAll({
      where: { patientId: patient.id },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        patient: {
          patientId: patient.patientId,
          name: patient.name,
          age: patient.age,
          gender: patient.gender
        },
        predictions
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all predictions (with pagination)
const getAllPredictions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await Prediction.findAndCountAll({
      include: [
        { model: Patient, attributes: ['patientId', 'name', 'age', 'gender'] }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      success: true,
      data: {
        predictions: rows,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update prediction notes
const updatePrediction = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctorNotes } = req.body;

    const prediction = await Prediction.findByPk(id);
    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: 'Prediction not found'
      });
    }

    prediction.doctorNotes = doctorNotes;
    await prediction.save();

    res.json({
      success: true,
      message: 'Prediction updated successfully',
      data: prediction
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createPrediction,
  getPredictionById,
  getPatientPredictions,
  getAllPredictions,
  updatePrediction
};