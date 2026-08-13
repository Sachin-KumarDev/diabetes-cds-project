const axios = require('axios');

// Chatbot service URL
const CHATBOT_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Start a chat session
const startChat = async (req, res) => {
  try {
    const { patientData } = req.body;

    const response = await axios.post(`${CHATBOT_URL}/api/chat/start`, {
      patient_data: patientData || null
    });

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Chat start error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to start chat session'
    });
  }
};

// Send a message
const chat = async (req, res) => {
  try {
    const { question, sessionId, patientData } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Question is required'
      });
    }

    const response = await axios.post(`${CHATBOT_URL}/api/chat`, {
      question,
      session_id: sessionId,
      patient_data: patientData || null
    });

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat response'
    });
  }
};

// Get suggested questions
const getSuggestedQuestions = async (req, res) => {
  try {
    const response = await axios.get(`${CHATBOT_URL}/api/chat/suggested`);
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    // Fallback questions
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
};

module.exports = {
  startChat,
  chat,
  getSuggestedQuestions
};