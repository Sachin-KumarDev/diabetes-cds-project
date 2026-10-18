import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import PatientForm from './components/patients/PatientForm';
import PatientList from './components/patients/PatientList';
import PredictionForm from './components/predictions/PredictionForm';
import PatientHistory from './components/history/PatientHistory';
import ChatInterface from './components/chat/ChatInterface';
import Layout from './components/common/Layout';

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/patients" element={
            <ProtectedRoute>
              <Layout>
                <PatientList />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/patients/new" element={
            <ProtectedRoute>
              <Layout>
                <PatientForm />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/predict" element={
            <ProtectedRoute>
              <Layout>
                <PredictionForm />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/history/:patientId" element={
            <ProtectedRoute>
              <Layout>
                <PatientHistory />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/chat" element={
            <ProtectedRoute>
              <Layout>
                <ChatInterface />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;