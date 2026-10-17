import React from 'react';

import { NavLink } from 'react-router-dom';

import {
  FiHome,
  FiUsers,
  FiActivity,
  FiMessageSquare,
  FiLogOut,
  FiClock
} from 'react-icons/fi';

import { useAuth } from '../../context/AuthContext';

import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const role = user?.role;

  const commonItems = [
    {
      to: '/',
      icon: FiHome,
      label: 'Dashboard'
    },
    {
      to: '/patients',
      icon: FiUsers,
      label: 'Patients'
    }
  ];

  const roleItems = {
    doctor: [
      {
        to: '/predict',
        icon: FiActivity,
        label: 'Predict'
      },
      {
        to: '/chat',
        icon: FiMessageSquare,
        label: 'Clinical Chat'
      }
    ],

    nurse: [
      {
        to: '/patients',
        icon: FiUsers,
        label: 'Patient Monitoring'
      }
    ],

    admin: []
  };

  const navItems = [
    ...commonItems,
    ...(roleItems[role] || [])
  ];

  return (
    <div className="sidebar">

      <div className="sidebar-logo">
        🏥
      </div>

      <nav className="sidebar-nav">

        {navItems.map(({ to, icon: Icon, label }, index) => (
          <NavLink
            key={`${to}-${index}`}
            to={to}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
            title={label}
          >
            <Icon size={22} />
          </NavLink>
        ))}

      </nav>

      <div className="sidebar-footer">

        <button
          onClick={logout}
          className="logout-btn"
          title="Logout"
        >
          <FiLogOut size={22} />
        </button>

      </div>

    </div>
  );
};

export default Sidebar;