import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Auth from './components/Auth';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Employees from './pages/Employees';
import Timeline from './pages/Timeline';
import Settings from './pages/Settings';


// Main App Content Component
function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { user, loading, handleAuthSuccess } = useAuth();

  // Load theme from localStorage
  useEffect(() => {

    // Load and apply saved theme
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.appearance && settings.appearance.theme) {
          document.documentElement.setAttribute('data-theme', settings.appearance.theme);
        }
        if (settings.appearance && settings.appearance.fontSize) {
          const sizeMap = {
            small: '14px',
            medium: '16px',
            large: '18px'
          };
          document.documentElement.style.setProperty('--base-font-size', sizeMap[settings.appearance.fontSize]);
        }
      } catch (error) {
        console.error('Error loading saved settings:', error);
      }
    }
  }, []);


  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show Auth component if not authenticated
  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  // Show main app if authenticated
  return (
    <Router>
      <div className="app-layout">
        <Sidebar 
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
        <div className="main-content">
          <Header 
            currentPage={currentPage}
          />
          <div className="content-wrapper">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/assets" element={<Assets />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
