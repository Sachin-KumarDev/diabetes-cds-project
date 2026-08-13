const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Prediction = sequelize.define('Prediction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Patients',
      key: 'id'
    }
  },
  // Patient input data
  gender: DataTypes.STRING(10),
  age: DataTypes.FLOAT,
  hypertension: DataTypes.INTEGER,
  heartDisease: DataTypes.INTEGER,
  smokingHistory: DataTypes.STRING(50),
  bmi: DataTypes.FLOAT,
  hba1c: DataTypes.FLOAT,
  bloodGlucose: DataTypes.INTEGER,
  
  // Prediction results
  prediction: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  probability: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  riskLevel: {
    type: DataTypes.ENUM('HIGH', 'MODERATE', 'LOW'),
    allowNull: false
  },
  confidence: {
    type: DataTypes.STRING(20)
  },
  
  // SHAP explanation (stored as JSON)
  explanation: {
    type: DataTypes.JSON,
    allowNull: true
  },
  
  doctorNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  timestamps: true
});

module.exports = Prediction;