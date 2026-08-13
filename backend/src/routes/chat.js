const express = require('express');
const router = express.Router();
const { auth, optionalAuth } = require('../middleware/auth');
const {
  startChat,
  chat,
  getSuggestedQuestions
} = require('../controllers/chatController');

// Public routes (with optional auth)
router.get('/suggested', optionalAuth, getSuggestedQuestions);

// Protected routes
router.post('/start', auth, startChat);
router.post('/', auth, chat);

module.exports = router;