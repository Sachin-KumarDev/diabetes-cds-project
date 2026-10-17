import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import PredictionResult from './PredictionResult';
import './PredictionForm.css';

/* -------- Validation Helpers -------- */
const validateMobile = (mobile) => {
  if (!mobile || mobile.trim() === '') return { valid: true }; // Optional

  const cleaned = mobile.trim();
  const mobileRegex = /^\+?[0-9]{1,4}[\s-]?[0-9]{6,14}$/;

  if (!mobileRegex.test(cleaned)) {
    return {
      valid: false,
      message: 'Enter a valid mobile number (10–15 digits, optional +country code)',
    };
  }
  return { valid: true };
};

const validateEmail = (email) => {
  if (!email || email.trim() === '') return { valid: true }; // Optional

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, message: 'Enter a valid email address' };
  }
  return { valid: true };
};

/* -------- Component -------- */
const PredictionForm = () => {
  const [formData, setFormData] = useState({
    patientId: '',
    name: '',
    age: '',
    gender: 'Male',
    contactNumber: '',
    email: '',
    hypertension: 0,
    heartDisease: 0,
    smokingHistory: 'never',
    bmi: '',
    hba1c: '',
    bloodGlucose: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) : value,
    });

    // Clear the error for this field as the user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- Required field check ---
    if (
      !formData.patientId ||
      !formData.name ||
      !formData.age ||
      !formData.bmi ||
      !formData.hba1c ||
      !formData.bloodGlucose
    ) {
      toast.error('Please fill all required fields');
      return;
    }

    // --- Validate mobile ---
    const mobileCheck = validateMobile(formData.contactNumber);
    if (!mobileCheck.valid) {
      setErrors({ ...errors, contactNumber: mobileCheck.message });
      toast.error(mobileCheck.message);
      return;
    }

    // --- Validate email ---
    const emailCheck = validateEmail(formData.email);
    if (!emailCheck.valid) {
      setErrors({ ...errors, email: emailCheck.message });
      toast.error(emailCheck.message);
      return;
    }

    setLoading(true);
    setResult(null);

    const payload = {
      patientId: formData.patientId.trim(),
      name: formData.name.trim(),
      age: parseFloat(formData.age),
      gender: formData.gender,
      contactNumber: formData.contactNumber.trim() || null,
      email: formData.email.trim() || null,
      hypertension: parseInt(formData.hypertension),
      heartDisease: parseInt(formData.heartDisease),
      smokingHistory: formData.smokingHistory,
      bmi: parseFloat(formData.bmi),
      hba1c: parseFloat(formData.hba1c),
      bloodGlucose: parseInt(formData.bloodGlucose),
    };

    try {
      const response = await api.post('/predictions', payload);
      setResult(response.data.data);
      toast.success('Prediction completed!');
      setErrors({});
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        toast.error('Validation error: ' + JSON.stringify(error.response.data.errors));
      } else {
        toast.error('Prediction failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prediction-container">
      <h2>Diabetes Risk Prediction</h2>

      <div className="prediction-grid">
        <div className="prediction-form-container">
          <form onSubmit={handleSubmit} className="prediction-form">
            {/* Row 1: Patient ID + Full Name */}
            <div className="form-row">
              <div className="form-group">
                <label>Patient ID *</label>
                <input
                  type="text"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  placeholder="PAT-2024-0001"
                  required
                />
              </div>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* Row 2: Mobile + Email */}
            <div className="form-row">
              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className={errors.contactNumber ? 'input-error' : ''}
                  maxLength={20}
                />
                {errors.contactNumber && (
                  <span className="field-error">{errors.contactNumber}</span>
                )}
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="patient@email.com"
                  className={errors.email ? 'input-error' : ''}
                  maxLength={100}
                />
                {errors.email && (
                  <span className="field-error">{errors.email}</span>
                )}
              </div>
            </div>

            {/* Row 3: Age + Gender */}
            <div className="form-row">
              <div className="form-group">
                <label>Age *</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="45"
                  required
                />
              </div>
              <div className="form-group">
                <label>Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            {/* Row 4: BMI + HbA1c */}
            <div className="form-row">
              <div className="form-group">
                <label>BMI *</label>
                <input
                  type="number"
                  step="0.1"
                  name="bmi"
                  value={formData.bmi}
                  onChange={handleChange}
                  placeholder="33.6"
                  required
                />
              </div>
              <div className="form-group">
                <label>HbA1c (%) *</label>
                <input
                  type="number"
                  step="0.1"
                  name="hba1c"
                  value={formData.hba1c}
                  onChange={handleChange}
                  placeholder="6.8"
                  required
                />
              </div>
            </div>

            {/* Row 5: Blood Glucose + Smoking */}
            <div className="form-row">
              <div className="form-group">
                <label>Blood Glucose (mg/dL) *</label>
                <input
                  type="number"
                  name="bloodGlucose"
                  value={formData.bloodGlucose}
                  onChange={handleChange}
                  placeholder="160"
                  required
                />
              </div>
              <div className="form-group">
                <label>Smoking History</label>
                <select
                  name="smokingHistory"
                  value={formData.smokingHistory}
                  onChange={handleChange}
                >
                  <option value="never">Never</option>
                  <option value="former">Former</option>
                  <option value="current">Current</option>
                  <option value="ever">Ever</option>
                  <option value="No Info">No Info</option>
                </select>
              </div>
            </div>

            {/* Row 6: Hypertension + Heart Disease */}
            <div className="form-row">
              <div className="form-group">
                <label>Hypertension</label>
                <select
                  name="hypertension"
                  value={formData.hypertension}
                  onChange={handleChange}
                >
                  <option value={0}>No</option>
                  <option value={1}>Yes</option>
                </select>
              </div>
              <div className="form-group">
                <label>Heart Disease</label>
                <select
                  name="heartDisease"
                  value={formData.heartDisease}
                  onChange={handleChange}
                >
                  <option value={0}>No</option>
                  <option value={1}>Yes</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-predict" disabled={loading}>
              {loading ? 'Predicting...' : '🔮 Predict Diabetes Risk'}
            </button>
          </form>
        </div>

        {result && (
          <div className="prediction-result-container">
            <PredictionResult result={result} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionForm;