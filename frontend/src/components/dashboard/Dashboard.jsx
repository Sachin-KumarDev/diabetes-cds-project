import React from 'react';
import { useAuth } from '../../context/AuthContext';

import DoctorDashboard from './DoctorDashboard';
import NurseDashboard from './NurseDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'doctor') {
    return <DoctorDashboard />;
  }

  if (user?.role === 'nurse') {
    return <NurseDashboard />;
  }

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  return <DoctorDashboard />;
};

export default Dashboard;