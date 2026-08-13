const Patient = require('../models/Patient');
const Prediction = require('../models/Prediction');

// Get patient history
const getPatientHistory = async (req, res) => {
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
        predictions: predictions.map(p => ({
          id: p.id,
          date: p.createdAt,
          prediction: p.prediction,
          probability: p.probability,
          riskLevel: p.riskLevel,
          bloodGlucose: p.bloodGlucose,
          bmi: p.bmi,
          hba1c: p.hba1c
        }))
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get history summary
const getHistorySummary = async (req, res) => {
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
      order: [['createdAt', 'ASC']]
    });

    if (predictions.length === 0) {
      return res.json({
        success: true,
        data: { message: 'No predictions found for this patient' }
      });
    }

    const first = predictions[0];
    const last = predictions[predictions.length - 1];
    
    const glucoseTrend = last.bloodGlucose - first.bloodGlucose;
    const bmiTrend = last.bmi - first.bmi;
    const hba1cTrend = last.hba1c - first.hba1c;

    res.json({
      success: true,
      data: {
        totalPredictions: predictions.length,
        firstPrediction: {
          date: first.createdAt,
          glucose: first.bloodGlucose,
          bmi: first.bmi,
          hba1c: first.hba1c
        },
        lastPrediction: {
          date: last.createdAt,
          glucose: last.bloodGlucose,
          bmi: last.bmi,
          hba1c: last.hba1c
        },
        trends: {
          glucose: {
            change: glucoseTrend,
            direction: glucoseTrend > 0 ? 'increasing' : 'decreasing',
            status: glucoseTrend > 0 ? '⚠️ Needs attention' : '✅ Improving'
          },
          bmi: {
            change: bmiTrend,
            direction: bmiTrend > 0 ? 'increasing' : 'decreasing',
            status: bmiTrend > 0 ? '⚠️ Monitor weight' : '✅ Improving'
          },
          hba1c: {
            change: hba1cTrend,
            direction: hba1cTrend > 0 ? 'increasing' : 'decreasing',
            status: hba1cTrend > 0 ? '⚠️ Needs attention' : '✅ Improving'
          }
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

// Export report
const exportReport = async (req, res) => {
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

    let csvData = 'Date,Age,Gender,BMI,Blood Glucose,HbA1c,Prediction,Risk Level,Probability\n';
    
    predictions.forEach(p => {
      csvData += `${p.createdAt},${patient.age},${patient.gender},${p.bmi},${p.bloodGlucose},${p.hba1c},${p.prediction === 1 ? 'Diabetes' : 'No Diabetes'},${p.riskLevel},${(p.probability * 100).toFixed(2)}%\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=patient_${patientId}_report.csv`);
    res.send(csvData);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getPatientHistory,
  getHistorySummary,
  exportReport
};