import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import './PredictionResult.css';

/* -------- Helpers -------- */
const getBmiCategory = (bmi) => {
  if (!bmi) return { label: '—', color: '#a0aec0' };
  if (bmi < 18.5) return { label: 'Underweight', color: '#4299e1' };
  if (bmi < 25) return { label: 'Normal', color: '#48bb78' };
  if (bmi < 30) return { label: 'Overweight', color: '#ed8936' };
  return { label: 'Obese', color: '#fc8181' };
};

const getGlucoseCategory = (g) => {
  if (!g) return { label: '—', color: '#a0aec0' };
  if (g < 100) return { label: 'Normal', color: '#48bb78' };
  if (g < 126) return { label: 'Prediabetic', color: '#ed8936' };
  return { label: 'Diabetic', color: '#fc8181' };
};

const getHba1cCategory = (h) => {
  if (!h) return { label: '—', color: '#a0aec0' };
  if (h < 5.7) return { label: 'Normal', color: '#48bb78' };
  if (h < 6.5) return { label: 'Prediabetic', color: '#ed8936' };
  return { label: 'Diabetic', color: '#fc8181' };
};

const getAgeCategory = (age) => {
  if (!age) return { label: '—', color: '#a0aec0' };
  if (age < 30) return { label: 'Low Risk', color: '#48bb78' };
  if (age < 45) return { label: 'Moderate', color: '#ed8936' };
  return { label: 'High Risk', color: '#fc8181' };
};

/* -------- Auto-generate human-readable SHAP conclusion -------- */
const generateConclusion = (shapData, result) => {
  if (!shapData || shapData.length === 0) {
    return 'No feature explanation available for this prediction.';
  }

  const positive = shapData.filter((f) => f.impact > 0);
  const negative = shapData.filter((f) => f.impact < 0);

  const topPositive = positive[0];
  const topNegative = negative[0];

  const riskLabel = result.riskLevel;
  const confidence = (result.probability * 100).toFixed(1);

  let conclusion = `The model predicts ${riskLabel} risk with ${confidence}% confidence. `;

  if (topPositive) {
    conclusion += `The strongest factor increasing risk is ${topPositive.name}. `;
  }

  if (topNegative) {
    conclusion += `The factor most protective against diabetes for this patient is ${topNegative.name}. `;
  }

  if (riskLabel === 'HIGH') {
    conclusion +=
      'Immediate clinical review and lifestyle intervention are recommended.';
  } else if (riskLabel === 'MODERATE') {
    conclusion +=
      'Lifestyle modifications and a follow-up within 3 months are advised.';
  } else {
    conclusion +=
      'Continue routine screening and maintain a healthy lifestyle.';
  }

  return conclusion;
};

/* -------- Component -------- */
const PredictionResult = ({ result }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const isHighRisk = result.riskLevel === 'HIGH';
  const isModerate = result.riskLevel === 'MODERATE';
  const riskColor = isHighRisk ? '#fc8181' : isModerate ? '#ed8936' : '#48bb78';
  const riskEmoji = isHighRisk ? '🔴' : isModerate ? '🟡' : '🟢';
  const riskBg = isHighRisk ? '#fff5f5' : isModerate ? '#fffaeb' : '#f0fff4';

  const explanation = result.explanation;

  const formatFeatureName = (name) =>
    name
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');

  const shapData =
    explanation?.top_factors?.map((f) => ({
      name: formatFeatureName(f.feature),
      impact: f.impact,
      color: f.impact > 0 ? '#fc8181' : '#48bb78',
      direction: f.direction,
    })) || [];

  const maxAbs = Math.max(...shapData.map((d) => Math.abs(d.impact)), 0.1);

  const vitals = [
    {
      label: 'Age',
      value: result.age ?? '—',
      unit: 'years',
      category: getAgeCategory(result.age),
    },
    {
      label: 'BMI',
      value: result.bmi ?? '—',
      unit: 'kg/m²',
      category: getBmiCategory(result.bmi),
    },
    {
      label: 'HbA1c',
      value: result.hba1c ?? '—',
      unit: '%',
      category: getHba1cCategory(result.hba1c),
    },
    {
      label: 'Blood Glucose',
      value: result.bloodGlucose ?? '—',
      unit: 'mg/dL',
      category: getGlucoseCategory(result.bloodGlucose),
    },
  ];

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—';

  return (
    <div className="prediction-result">
      {/* ---------- RISK BANNER ---------- */}
      <div
        className="risk-banner"
        style={{ background: riskBg, borderColor: riskColor }}
      >
        <div className="risk-banner-left">
          <div className="risk-banner-emoji">{riskEmoji}</div>
          <div>
            <div className="risk-banner-title" style={{ color: riskColor }}>
              {result.riskLevel} RISK
            </div>
            <div className="risk-banner-subtitle">
              {result.prediction === 1
                ? 'Diabetes detected'
                : 'No diabetes detected'}
            </div>
          </div>
        </div>
        <div className="risk-banner-right">
          <div className="risk-banner-confidence" style={{ color: riskColor }}>
            {(result.probability * 100).toFixed(2)}%
          </div>
          <div className="risk-banner-confidence-label">Confidence</div>
        </div>
      </div>

      {/* ---------- CONFIDENCE BAR ---------- */}
      <div className="result-confidence">
        <div className="confidence-bar-bg">
          <div
            className="confidence-bar"
            style={{
              width: `${(result.probability * 100).toFixed(1)}%`,
              background: riskColor,
            }}
          />
        </div>
      </div>

      {/* ---------- TABS ---------- */}
      <div className="result-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📋 Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'explanation' ? 'active' : ''}`}
          onClick={() => setActiveTab('explanation')}
          disabled={!explanation}
        >
          🔍 Explain (SHAP)
        </button>
      </div>

      {/* ---------- OVERVIEW TAB ---------- */}
      {activeTab === 'overview' && (
        <div className="overview-container">
          <div className="section-title-bar">
            <h4 className="section-title">Patient Vitals</h4>
            <span className="section-subtitle">
              Key measurements for this prediction
            </span>
          </div>

          <div className="vitals-grid">
            {vitals.map((v, i) => (
              <div key={i} className="vital-card">
                <div className="vital-label">{v.label}</div>
                <div className="vital-value">
                  {v.value}
                  <span className="vital-unit">{v.unit}</span>
                </div>
                <div
                  className="vital-chip"
                  style={{
                    background: `${v.category.color}15`,
                    color: v.category.color,
                  }}
                >
                  ● {v.category.label}
                </div>
              </div>
            ))}
          </div>

          <div className="section-title-bar" style={{ marginTop: '24px' }}>
            <h4 className="section-title">Prediction Details</h4>
          </div>

          <div className="meta-grid">
            <div className="meta-card">
              <div className="meta-label">Patient ID</div>
              <div className="meta-value">{result.patientId || '—'}</div>
            </div>
            <div className="meta-card">
              <div className="meta-label">Patient Name</div>
              <div className="meta-value">{result.patientName || '—'}</div>
            </div>
            <div className="meta-card">
              <div className="meta-label">Prediction ID</div>
              <div className="meta-value">#{result.predictionId || '—'}</div>
            </div>
            <div className="meta-card">
              <div className="meta-label">Generated At</div>
              <div className="meta-value">{fmtDate(result.createdAt)}</div>
            </div>
          </div>

          <div className="clinical-note" style={{ borderColor: riskColor }}>
            <div className="clinical-note-icon">💡</div>
            <div>
              <div className="clinical-note-title">Clinical Interpretation</div>
              <div className="clinical-note-text">
                {isHighRisk
                  ? 'Patient shows multiple risk indicators. Consider immediate lifestyle intervention and specialist referral.'
                  : isModerate
                  ? 'Patient shows moderate risk indicators. Recommend lifestyle modifications and follow-up in 3 months.'
                  : 'Patient shows low risk indicators. Continue routine screening.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- EXPLANATION TAB ---------- */}
      {activeTab === 'explanation' && explanation && (
        <div className="explanation-container">
          <div className="section-title-bar">
            <h4 className="section-title">Generated Graph</h4>
            <span className="section-subtitle">
              These factors influenced the AI's decision most
            </span>
          </div>

          {shapData.length > 0 && (
            <div className="shap-chart-large">
              <ResponsiveContainer width="100%" height={420}>
                <BarChart
                  data={shapData}
                  margin={{ top: 30, right: 30, left: 20, bottom: 120 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                  />
                  <XAxis
                    type="category"
                    dataKey="name"
                    stroke="#2d3748"
                    fontSize={12}
                    fontWeight={600}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={120}
                  />
                  <YAxis
                    type="number"
                    stroke="#4a5568"
                    fontSize={12}
                    domain={[-maxAbs * 1.2, maxAbs * 1.2]}
                    tickFormatter={(v) => v.toFixed(2)}
                  />
                  <Tooltip
                    formatter={(value) => [value.toFixed(4), 'SHAP Impact']}
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '13px',
                      padding: '10px 14px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                  />
                  <ReferenceLine y={0} stroke="#718096" strokeWidth={1.5} />
                  <Bar
                    dataKey="impact"
                    fill="#48bb78"
                    radius={[8, 8, 0, 0]}
                    barSize={90}
                    minPointSize={10}
                  >
                    {shapData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {/* 🎯 Auto-generated AI Conclusion */}
              <div
                className="shap-conclusion"
                style={{ borderColor: riskColor }}
              >
                <div className="shap-conclusion-header">
                  <span className="shap-conclusion-icon">🧠</span>
                  <span className="shap-conclusion-title">AI Conclusion</span>
                </div>
                <p className="shap-conclusion-text">
                  {generateConclusion(shapData, result)}
                </p>
              </div>
            </div>
          )}

          <div className="shap-legend">
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#fc8181' }} />
              <span>Increases Diabetes Risk</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#48bb78' }} />
              <span>Decreases Diabetes Risk</span>
            </div>
          </div>

          {shapData.length > 0 && (
            <div className="top-factors">
              <h4 className="section-title">Feature Contributions</h4>
              {shapData.map((factor, i) => (
                <div key={i} className="factor-row">
                  <div className="factor-left">
                    <span className="factor-rank">{i + 1}</span>
                    <span className="factor-name">{factor.name}</span>
                  </div>
                  <div className="factor-impact">
                    <span
                      className="factor-chip"
                      style={{
                        background: `${factor.color}15`,
                        color: factor.color,
                      }}
                    >
                      {factor.impact > 0 ? '↑' : '↓'}{' '}
                      {Math.abs(factor.impact).toFixed(3)}
                    </span>
                    <span className="factor-direction">
                      {factor.impact > 0 ? 'increases risk' : 'decreases risk'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="shap-base-value">
            <span className="base-label">Base Value</span>
            <span className="base-number">
              {((explanation?.base_value || 0.5) * 100).toFixed(2)}%
            </span>
            <span className="base-note">Average population risk</span>
          </div>
        </div>
      )}

      {/* ---------- ACTIONS ---------- */}
      <div className="result-actions">
        <button
          className="btn-chat"
          onClick={() => (window.location.href = '/chat')}
        >
          💬 Ask AI Assistant
        </button>
      </div>
    </div>
  );
};

export default PredictionResult;