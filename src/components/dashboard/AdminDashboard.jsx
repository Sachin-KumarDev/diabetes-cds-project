import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../../services/api';

import './Dashboard.css';

const AdminDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const patientsRes = await api.get('/patients');

      const patientData = patientsRes.data.data || [];

      setPatients(patientData);
    } catch (error) {
      console.error('Admin Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading admin dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard">

      {/* Dashboard Header */}
      <div className="dashboard-header">

        <div>
          <h1>Admin Dashboard</h1>

          <p>
            System administration and overall system overview
          </p>
        </div>

      </div>

      {/* System Statistics */}
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
            System Status
          </div>

          <div
            className="stat-value"
            style={{ color: '#48bb78', fontSize: '20px' }}
          >
            Online
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            Prediction System
          </div>

          <div
            className="stat-value"
            style={{ color: '#48bb78', fontSize: '20px' }}
          >
            Active
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            ML Service
          </div>

          <div
            className="stat-value"
            style={{ color: '#48bb78', fontSize: '20px' }}
          >
            Active
          </div>
        </div>

      </div>

      {/* Administration Actions */}
      <div className="dashboard-grid">

        <div className="card quick-actions">

          <h3>Administration</h3>

          <div className="action-grid">

            <button
              onClick={() => navigate('/patients')}
              className="action-btn"
            >
              <span>👥</span>
              Patient Overview
            </button>

            <button
              onClick={() => navigate('/register')}
              className="action-btn"
            >
              <span>➕</span>
              Add User
            </button>

            <button
              onClick={() => navigate('/patients')}
              className="action-btn"
            >
              <span>📊</span>
              System Data
            </button>

          </div>

        </div>

      </div>

      {/* System Information */}
      <div className="card">

        <h3>System Information</h3>

        <div style={{ lineHeight: '1.8' }}>

          <p>
            <strong>Application:</strong> Diabetes CDSS
          </p>

          <p>
            <strong>Frontend:</strong> React
          </p>

          <p>
            <strong>Backend:</strong> Node.js + Express
          </p>

          <p>
            <strong>Database:</strong> MySQL
          </p>

          <p>
            <strong>ML Service:</strong> Python + FastAPI
          </p>

          <p>
            <strong>System Role:</strong> Administrator
          </p>

        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;