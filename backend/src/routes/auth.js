const express = require('express');
const router = express.Router();
const { validate, validateUser, validateLogin } = require('../middleware/validation');
const { register, login, getCurrentUser, logout } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Public routes
router.post('/register', validate(validateUser), register);
router.post('/login', validate(validateLogin), login);

// Protected routes
router.get('/me', auth, getCurrentUser);
router.post('/logout', auth, logout);

module.exports = router;