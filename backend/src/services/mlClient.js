const axios = require('axios');

class MLServiceClient {
  constructor() {
    this.baseURL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    this.timeout = 30000;

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /** Get prediction + SHAP explanation */
  async predict(patientData) {
    try {
      const mappedData = {
        gender: patientData.gender,
        age: patientData.age,
        hypertension: patientData.hypertension,
        heart_disease: patientData.heartDisease,
        smoking_history: patientData.smokingHistory,
        bmi: patientData.bmi,
        HbA1c_level: patientData.hba1c,
        blood_glucose_level: patientData.bloodGlucose,
      };

      console.log('📤 Sending to ML service:', mappedData);

      // Use the explain endpoint to get SHAP values
      const response = await this.client.post('/predict/explain', mappedData);

      console.log('📥 ML service response received');
      console.log('   Prediction:', response.data.prediction);
      console.log('   Risk:', response.data.risk_level);
      console.log('   Has explanation:', !!response.data.explanation);

      return {
        success: true,
        prediction: response.data.prediction,
        probability: response.data.diabetes_probability,
        riskLevel: response.data.risk_level,
        confidence: response.data.confidence,
        explanation: response.data.explanation || null,
        raw: response.data,
      };
    } catch (error) {
      console.error('❌ ML Service Error:', error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', error.response.data);
      }
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'ML service unavailable',
      };
    }
  }

  /** Health check */
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  /** Global feature importance */
  async getFeatureImportance() {
    try {
      const response = await this.client.get('/features');
      return response.data;
    } catch (error) {
      return { error: error.message };
    }
  }
}

module.exports = new MLServiceClient();