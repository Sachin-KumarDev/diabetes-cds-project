const axios = require('axios');

class MLServiceClient {
  constructor() {
    this.baseURL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    this.timeout = 30000; // 30 seconds
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  // Get prediction
  async predict(patientData) {
    try {
      // Map frontend field names to ML service field names
      const mappedData = {
        gender: patientData.gender,
        age: patientData.age,
        hypertension: patientData.hypertension,
        heart_disease: patientData.heartDisease,
        smoking_history: patientData.smokingHistory,
        bmi: patientData.bmi,
        HbA1c_level: patientData.hba1c,
        blood_glucose_level: patientData.bloodGlucose
      };

      const response = await this.client.post('/predict', mappedData);
      
      return {
        success: true,
        prediction: response.data.prediction,
        probability: response.data.diabetes_probability,
        riskLevel: response.data.risk_level,
        confidence: response.data.confidence,
        raw: response.data
      };
    } catch (error) {
      console.error('ML Service Error:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        return {
          success: false,
          error: error.response.data.message || 'Prediction failed'
        };
      }
      return {
        success: false,
        error: 'ML service unavailable'
      };
    }
  }

  // Get features
  async getFeatures() {
    try {
      const response = await this.client.get('/features');
      return response.data;
    } catch (error) {
      return { error: error.message };
    }
  }

  // Get model metadata
  async getMetadata() {
    try {
      const response = await this.client.get('/metadata');
      return response.data;
    } catch (error) {
      return { error: error.message };
    }
  }
}

module.exports = new MLServiceClient();