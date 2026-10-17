import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="header">
      <div className="header-left">
        <h1>Diabetes CDSS</h1>
        <span className="subtitle">Clinical Decision Support</span>
      </div>
      <div className="header-right">
        <div className="doctor-profile">
          <div className="avatar">{user?.name?.charAt(0) || 'D'}</div>
          <div className="info">
            <div className="name">{user?.name || 'Doctor'}</div>
            <div className="role">{user?.role || 'Doctor'}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;