import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import Header from './components/layout/Header';
import PrivateRoute from './components/routing/PrivateRoute';
import './App.css';

// Create a wrapper component for routes that need auth context
const AppContent = () => {
  const { isAuthenticated, loading, loadUser } = useAuth();

  useEffect(() => {
    loadUser();
  }, []); // Empty dependency array to run only once on mount

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <Header />
      <div className="container">
        <Routes>
          <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;