import React from 'react';
import './StatsCards.css';

const StatsCards = ({ stats }) => {
  if (!stats) return null;

  const cards = [
    { label: 'Total Patients', value: stats.totalPatients, color: '#48bb78' },
    { label: 'High Risk', value: stats.highRisk, color: '#fc8181' },
    { label: 'Moderate Risk', value: stats.moderateRisk, color: '#ed8936' },
    { label: 'Low Risk', value: stats.lowRisk, color: '#48bb78' }
  ];

  return (
    <div className="stats-cards">
      {cards.map((card, index) => (
        <div key={index} className="stat-card">
          <div className="stat-label">{card.label}</div>
          <div className="stat-value" style={{ color: card.color }}>
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;