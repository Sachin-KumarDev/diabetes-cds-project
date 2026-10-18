const Patient = require('../models/Patient');
const Prediction = require('../models/Prediction');
const mlClient = require('../services/mlClient');

/* ---------------- CREATE PREDICTION ---------------- */
const createPrediction = async (req, res) => {
  try {
    const patientData = req.body;
    console.log('📤 Prediction request:', patientData.patientId);

    // 1) Ensure patient exists
    let patient = await Patient.findOne({
      where: { patientId: patientData.patientId },
    });

    if (!patient) {
      patient = await Patient.create({
        patientId: patientData.patientId,
        name: patientData.name,
        age: patientData.age,
        gender: patientData.gender,
        contactNumber: patientData.contactNumber || null,
        email: patientData.email || null,
        address: patientData.address || null,
        medicalHistory: patientData.medicalHistory || null,
        createdBy: req.userId,
      });
      console.log('✅ New patient created:', patient.patientId);
    }

    // 2) Call ML service (with SHAP)
    const mlResult = await mlClient.predict(patientData);

    if (!mlResult.success) {
      return res.status(500).json({
        success: false,
        message: mlResult.error || 'Prediction failed',
      });
    }

    // 3) Clean risk level (strip emojis / extra chars)
    let riskLevel = mlResult.riskLevel || 'LOW';
    riskLevel = riskLevel.replace(/[^\w\s]/gi, '').trim().toUpperCase();
    if (riskLevel.includes('HIGH')) riskLevel = 'HIGH';
    else if (riskLevel.includes('MODERATE')) riskLevel = 'MODERATE';
    else riskLevel = 'LOW';

    // 4) Save prediction (including SHAP explanation JSON)
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
      riskLevel: riskLevel,
      confidence: mlResult.confidence,
      explanation: mlResult.explanation,       // ← SHAP saved here
      doctorNotes: patientData.doctorNotes || null,
      createdBy: req.userId,
    });

    console.log('✅ Prediction saved (id:', prediction.id, ')');

    // 5) Respond with everything (including explanation)
    res.json({
      success: true,
      data: {
        predictionId: prediction.id,
        patientId: patient.patientId,
        patientName: patient.name,
        prediction: mlResult.prediction,
        probability: mlResult.probability,
        riskLevel: riskLevel,
        confidence: mlResult.confidence,
        explanation: mlResult.explanation,     // ← sent to frontend
        createdAt: prediction.createdAt,
        age: patientData.age,
        bmi: patientData.bmi,
        hba1c: patientData.hba1c,
        bloodGlucose: patientData.bloodGlucose,
        gender: patientData.gender,
      },
    });
  } catch (error) {
    console.error('❌ Prediction error:', error.message);
    console.error(error.stack);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ---------------- GET BY ID ---------------- */
const getPredictionById = async (req, res) => {
  try {
    const prediction = await Prediction.findByPk(req.params.id, {
      include: [{ model: Patient, attributes: ['patientId', 'name', 'age', 'gender'] }],
    });
    if (!prediction) {
      return res.status(404).json({ success: false, message: 'Prediction not found' });
    }
    res.json({ success: true, data: prediction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ---------------- PATIENT PREDICTIONS ---------------- */
const getPatientPredictions = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await Patient.findOne({ where: { patientId } });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    const predictions = await Prediction.findAll({
      where: { patientId: patient.id },
      order: [['createdAt', 'DESC']],
    });
    res.json({
      success: true,
      data: {
        patient: {
          patientId: patient.patientId,
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
        },
        predictions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ---------------- ALL PREDICTIONS ---------------- */
const getAllPredictions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await Prediction.findAndCountAll({
      include: [{ model: Patient, attributes: ['patientId', 'name', 'age', 'gender'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.json({
      success: true,
      data: {
        predictions: rows,
        pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ---------------- UPDATE NOTES ---------------- */
const updatePrediction = async (req, res) => {
  try {
    const prediction = await Prediction.findByPk(req.params.id);
    if (!prediction) {
      return res.status(404).json({ success: false, message: 'Prediction not found' });
    }
    prediction.doctorNotes = req.body.doctorNotes;
    await prediction.save();
    res.json({ success: true, message: 'Updated', data: prediction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPrediction,
  getPredictionById,
  getPatientPredictions,
  getAllPredictions,
  updatePrediction,
};