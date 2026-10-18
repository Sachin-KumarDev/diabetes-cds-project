import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './PatientList.css';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      setPatients(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading patients...</div>;
  }

  return (
    <div className="patient-list-container">
      <div className="header-actions">
        <h2>Patients</h2>
        <button className="btn-primary" onClick={() => navigate('/patients/new')}>
          + Add Patient
        </button>
      </div>

      {patients.length === 0 ? (
        <div className="empty-state">
          <p>No patients yet. Add your first patient!</p>
        </div>
      ) : (
        <div className="patient-table-container">
          <table className="patient-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.patientId}</td>
                  <td>{patient.name}</td>
                  <td>{patient.age}</td>
                  <td>{patient.gender}</td>
                  <td>{patient.contactNumber || '-'}</td>
                  <td>
                    <button className="action-btn-small" onClick={() => navigate(`/history/${patient.patientId}`)}>
                      History
                    </button>
                    <button className="action-btn-small predict-btn" onClick={() => navigate('/predict', { state: { patient } })}>
                      Predict
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PatientList;