// backend/src/routes/chat.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Start chat session
router.post('/start', auth, async (req, res) => {
  try {
    // Forward to ML service
    const response = await axios.post(`${ML_SERVICE_URL}/chat/start`, {
      patient_data: req.body.patientData || null
    });
    res.json(response.data);
  } catch (error) {
    console.error('Chat start error:', error.message);
    
    // Fallback response if ML service fails
    res.json({
      success: true,
      data: {
        session_id: `session_${Date.now()}`,
        welcome_message: "👋 Hello! I'm Dr. AI, your clinical diabetes assistant. How can I help you today?",
        suggested_questions: [
          "What are the main risk factors for diabetes?",
          "What lifestyle changes do you recommend?",
          "What are the latest treatment guidelines?",
          "Explain the HbA1c result and its significance."
        ]
      }
    });
  }
});

// Send message
router.post('/', auth, async (req, res) => {
  try {
    const { question, session_id, patient_data } = req.body;
    
    const response = await axios.post(`${ML_SERVICE_URL}/chat`, {
      question,
      session_id,
      patient_data
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Chat error:', error.message);
    
    // Fallback response
    res.json({
      success: true,
      data: {
        response: "I'm here to help with diabetes-related questions. Please ask about risk factors, lifestyle changes, treatment options, or lab results.",
        suggested_questions: [
          "What are the main risk factors?",
          "What lifestyle changes work best?",
          "Explain HbA1c levels"
        ]
      }
    });
  }
});

// Get suggested questions
router.get('/suggested', auth, async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/chat/suggested`);
    res.json(response.data);
  } catch (error) {
    // Fallback
    res.json({
      success: true,
      data: {
        suggested_questions: [
          "What are the main risk factors for diabetes?",
          "What lifestyle changes do you recommend?",
          "What are the latest treatment guidelines?",
          "Explain the HbA1c result and its significance.",
          "What are the potential complications of diabetes?"
        ]
      }
    });
  }
});

module.exports = router;