import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './PatientForm.css';

const PatientForm = () => {
  const [formData, setFormData] = useState({
    name: '', age: '', gender: 'Male', contactNumber: '', email: '', address: '', medicalHistory: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/patients', formData);
      toast.success('Patient added successfully!');
      navigate('/patients');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="patient-form-container">
      <h2>Add New Patient</h2>
      <form onSubmit={handleSubmit} className="patient-form">
        <div className="form-row">
          <div className="form-group">
            <label>Full Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Age *</label>
            <input type="number" name="age" value={formData.age} onChange={handleChange} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Gender *</label>
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Contact Number</label>
            <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} />
          </div>
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Address</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Medical History</label>
          <textarea name="medicalHistory" value={formData.medicalHistory} onChange={handleChange} rows="3"></textarea>
        </div>
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/patients')} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Patient'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;