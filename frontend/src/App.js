import React, { useEffect, Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Auth from './components/Auth';
import Preloader from './components/Preloader';
import EnhancedLoader from './components/EnhancedLoader';

// ✅ Dashboard loads immediately (critical for first impression)
import Dashboard from './pages/Dashboard';

// ✅ Lazy load other pages (load only when needed)
const Assets = lazy(() => import('./pages/Assets'));
const Employees = lazy(() => import('./pages/Employees'));
const Timeline = lazy(() => import('./pages/Timeline'));
const Settings = lazy(() => import('./pages/Settings'));

// ✅ Enhanced loading component for lazy-loaded pages
const PageLoader = ({ message = "Loading page..." }) => (
  <EnhancedLoader 
    message={message}
    size="medium"
    showProgress={false}
  />
);


// Main App Content Component
function AppContent() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [preloadComplete, setPreloadComplete] = useState(false);

  // Get current page from the URL path
  const getCurrentPage = () => {
    const pathToPageMap = {
      '/dashboard': 'dashboard',
      '/assets': 'assets',
      '/employees': 'employees',
      '/timeline': 'timeline',
      '/settings': 'settings'
    };
    return pathToPageMap[location.pathname] || 'dashboard';
  };

  // Load theme from localStorage
  useEffect(() => {
    // Load and apply saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
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

  // Handle authentication redirects
  useEffect(() => {
    if (!loading) {
      // If user is authenticated and on login page, redirect to dashboard
      if (user && location.pathname === '/login') {
        navigate('/dashboard', { replace: true });
      }
      // Only redirect to login if user is explicitly not authenticated (not just loading)
      else if (!user && location.pathname !== '/login' && location.pathname !== '/') {
        navigate('/login', { replace: true });
      }
    }
  }, [user, loading, location.pathname, navigate]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show Auth component only if not authenticated and not loading
  if (!user && !loading) {
    return <Auth />;
  }

  // Show main app if authenticated
  return (
    <div className="app-layout">
      {/* ✅ Preload other pages in background after dashboard loads */}
      {user && <Preloader onPreloadComplete={() => setPreloadComplete(true)} />}
      
      <Sidebar 
        currentPage={getCurrentPage()}
        onPageChange={() => {}} // No longer needed since Sidebar handles navigation directly
      />
      <div className="main-content">
        <Header 
          currentPage={getCurrentPage()}
        />
        <div className="content-wrapper">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            
            {/* ✅ Dashboard loads immediately - no lazy loading needed */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* ✅ Lazy-loaded pages with Suspense and contextual messages */}
            <Route path="/assets" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader message="Loading Assets..." />}>
                  <Assets />
                </Suspense>
              </ProtectedRoute>
            } />
            
            <Route path="/employees" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader message="Loading Employees..." />}>
                  <Employees />
                </Suspense>
              </ProtectedRoute>
            } />
            
            <Route path="/timeline" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader message="Loading Timeline..." />}>
                  <Timeline />
                </Suspense>
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader message="Loading Settings..." />}>
                  <Settings />
                </Suspense>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
