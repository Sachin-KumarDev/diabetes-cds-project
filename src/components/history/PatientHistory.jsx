import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './PatientHistory.css';

const PatientHistory = () => {
  const { patientId } = useParams();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, [patientId]);

  const fetchHistory = async () => {
    try {
      const response = await api.get(`/predictions/patient/${patientId}`);
      setHistory(response.data.data);
    } catch (error) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="history-loading">Loading history...</div>;
  }

  if (!history || !history.predictions || history.predictions.length === 0) {
    return (
      <div className="history-empty">
        <h2>Patient History</h2>
        <p>No predictions found for this patient.</p>
        <button className="btn-primary" onClick={() => navigate('/predict')}>
          Make a Prediction
        </button>
      </div>
    );
  }

  return (
    <div className="history-container">
      <h2>Patient History</h2>
      
      <div className="patient-info">
        <div className="patient-info-card">
          <p><strong>Name:</strong> {history.patient.name}</p>
          <p><strong>Patient ID:</strong> {history.patient.patientId}</p>
          <p><strong>Age:</strong> {history.patient.age}</p>
          <p><strong>Gender:</strong> {history.patient.gender}</p>
        </div>
      </div>

      <div className="history-table-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Glucose</th>
              <th>BMI</th>
              <th>HbA1c</th>
              <th>Risk</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {history.predictions.map((pred) => (
              <tr key={pred.id}>
                <td>{new Date(pred.createdAt).toLocaleDateString()}</td>
                <td>{pred.bloodGlucose}</td>
                <td>{pred.bmi}</td>
                <td>{pred.hba1c}</td>
                <td>
                  <span className={`risk-badge ${pred.riskLevel?.toLowerCase()}`}>
                    {pred.riskLevel}
                  </span>
                </td>
                <td>{pred.confidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientHistory;