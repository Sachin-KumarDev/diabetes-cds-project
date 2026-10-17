import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../../services/api';

import './Dashboard.css';

const NurseDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');

      const patientData = response.data.data || [];

      setPatients(patientData);
    } catch (error) {
      console.error('Nurse Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const highRiskPatients = patients.filter(
    (patient) => patient.riskLevel === 'HIGH'
  );

  const moderateRiskPatients = patients.filter(
    (patient) => patient.riskLevel === 'MODERATE'
  );

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading nurse dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard">

      {/* Dashboard Header */}
      <div className="dashboard-header">

        <div>
          <h1>Nurse Dashboard</h1>

          <p>
            Patient monitoring and care overview
          </p>
        </div>

      </div>

      {/* Nurse Statistics */}
      <div className="stats-cards">

        <div className="stat-card">
          <div className="stat-label">
            Total Patients
          </div>

          <div className="stat-value">
            {patients.length}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            High Risk
          </div>

          <div
            className="stat-value"
            style={{ color: '#fc8181' }}
          >
            {highRiskPatients.length}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            Moderate Risk
          </div>

          <div
            className="stat-value"
            style={{ color: '#ed8936' }}
          >
            {moderateRiskPatients.length}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            Patients to Monitor
          </div>

          <div
            className="stat-value"
            style={{ color: '#4299e1' }}
          >
            {highRiskPatients.length + moderateRiskPatients.length}
          </div>
        </div>

      </div>

      {/* Nurse Actions */}
      <div className="dashboard-grid">

        <div className="card quick-actions">

          <h3>Patient Monitoring</h3>

          <div className="action-grid">

            <button
              onClick={() => navigate('/patients')}
              className="action-btn"
            >
              <span>👥</span>
              View Patients
            </button>

            <button
              onClick={() => navigate('/patients')}
              className="action-btn"
            >
              <span>🚨</span>
              High-Risk Patients
            </button>

          </div>

        </div>

      </div>

      {/* High Risk Patient Section */}
      <div className="card">

        <h3>High-Risk Patients</h3>

        {highRiskPatients.length === 0 ? (
          <p>No high-risk patients currently available.</p>
        ) : (
          <div>

            {highRiskPatients.slice(0, 5).map((patient) => (
              <div
                key={patient.id || patient.patientId}
                className="action-btn"
                style={{ marginBottom: '10px' }}
              >
                <span>🚨</span>

                <div>
                  <strong>
                    {patient.name || 'Unknown Patient'}
                  </strong>

                  <div>
                    Patient ID:{' '}
                    {patient.patientId || patient.id}
                  </div>
                </div>
              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
};

export default NurseDashboard;