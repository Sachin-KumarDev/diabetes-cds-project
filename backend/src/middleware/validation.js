const { body, param, query, validationResult } = require('express-validator');

// Validation rules
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    
    res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  };
};

// User validation
const validateUser = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['doctor', 'admin', 'nurse']).withMessage('Invalid role')
];

// Login validation
const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Patient validation
const validatePatient = [
  body('name').notEmpty().withMessage('Name is required'),
  body('age').isInt({ min: 0, max: 150 }).withMessage('Valid age is required'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Valid gender is required')
];

// Prediction validation
const validatePrediction = [
  body('gender').isIn(['Male', 'Female']).withMessage('Valid gender is required'),
  body('age').isFloat({ min: 0, max: 120 }).withMessage('Valid age is required'),
  body('hypertension').isInt({ min: 0, max: 1 }).withMessage('Hypertension must be 0 or 1'),
  body('heartDisease').isInt({ min: 0, max: 1 }).withMessage('Heart disease must be 0 or 1'),
  body('smokingHistory').notEmpty().withMessage('Smoking history is required'),
  body('bmi').isFloat({ min: 10, max: 70 }).withMessage('Valid BMI is required'),
  body('hba1c').isFloat({ min: 3, max: 15 }).withMessage('Valid HbA1c is required'),
  body('bloodGlucose').isInt({ min: 50, max: 500 }).withMessage('Valid blood glucose is required')
];

module.exports = {
  validate,
  validateUser,
  validateLogin,
  validatePatient,
  validatePrediction
};