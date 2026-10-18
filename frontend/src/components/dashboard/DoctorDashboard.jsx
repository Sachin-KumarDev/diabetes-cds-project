import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatsCards from './StatsCards';

const DoctorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const patientsRes = await api.get('/patients');
      const patients = patientsRes.data.data || [];

      setStats({
        totalPatients: patients.length,
        highRisk:
          patients.filter((p) => p.riskLevel === 'HIGH').length || 0,
        moderateRisk:
          patients.filter((p) => p.riskLevel === 'MODERATE').length || 0,
        lowRisk:
          patients.filter((p) => p.riskLevel === 'LOW').length || 0,
      });
    } catch (error) {
      console.error('Doctor dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading doctor dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard">

      <div className="dashboard-header">
        <div>
          <h1>Doctor Dashboard</h1>
          <p>Clinical overview and patient management</p>
        </div>

        <button
          className="btn-primary"
          onClick={() => navigate('/predict')}
        >
          + New Prediction
        </button>
      </div>

      <StatsCards stats={stats} />

      <div className="dashboard-grid">

        <div className="card quick-actions">
          <h3>Clinical Quick Actions</h3>

          <div className="action-grid">

            <button
              onClick={() => navigate('/patients/new')}
              className="action-btn"
            >
              <span>➕</span>
              Add Patient
            </button>

            <button
              onClick={() => navigate('/predict')}
              className="action-btn"
            >
              <span>🔮</span>
              New Prediction
            </button>

            <button
              onClick={() => navigate('/chat')}
              className="action-btn"
            >
              <span>💬</span>
              Clinical Chat
            </button>

            <button
              onClick={() => navigate('/patients')}
              className="action-btn"
            >
              <span>👤</span>
              View Patients
            </button>

          </div>
        </div>

      </div>

    </div>
  );
};

export default DoctorDashboard;