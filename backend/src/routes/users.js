
const express = require('express');
const router = express.Router();

const { auth, authorize } = require('../middleware/auth');
const {
  validate,
  validateUser
} = require('../middleware/validation');

const {
  getAllUsers,
  createUser,
  updateUserStatus
} = require('../controllers/userController');

// Every endpoint requires login and Admin permission.
router.use(auth, authorize('admin'));

// GET /api/users
router.get('/', getAllUsers);

// POST /api/users
router.post('/', validate(validateUser), createUser);

// PATCH /api/users/:id/status
router.patch('/:id/status', updateUserStatus);

module.exports = router;