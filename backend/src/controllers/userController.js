
const User = require('../models/User');

// GET /api/users — list users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        'id',
        'name',
        'email',
        'role',
        'specialization',
        'hospital',
        'isActive',
        'createdAt'
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve users'
    });
  }
};

// POST /api/users — create a user (Admin only)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, specialization, hospital } = req.body;

    if (!['doctor', 'nurse', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be doctor, nurse, or admin'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
      specialization,
      hospital
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialization: user.specialization,
        hospital: user.hospital,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Create user error:', error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
};

// PATCH /api/users/:id/status — activate/deactivate a user
const updateUserStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    if (typeof req.body.isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be true or false'
      });
    }

    // Prevent an administrator from deactivating their own account.
    if (id === req.user.id && req.body.isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = req.body.isActive;
    await user.save();

    return res.json({
      success: true,
      message: 'User status updated successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUserStatus
};