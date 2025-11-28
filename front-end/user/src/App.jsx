import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/theme.css';

// Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackgroundEffect from './components/BackgroundEffect';
import BackgroundSettings from './components/BackgroundSettings';

// Pages
import Home from './pages/Home';
import BookList from './pages/BookList';
import BookDetail from './pages/BookDetail';
import Categories from './pages/Categories';
import AddBook from './pages/AddBook';
import EditBook from './pages/EditBook';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import MyBooks from './pages/MyBooks';
import MyRejectedBooks from './pages/MyRejectedBooks';
import EditRejectedBook from './pages/EditRejectedBook';
import Notifications from './pages/Notifications';
import ReportUpdates from './pages/ReportUpdates';
import DeleteRequests from './pages/DeleteRequests';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Public Route Component - Redirect to home if already logged in
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Home Route - Redirect to login if not authenticated
const HomeRoute = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Home />;
};

// Layout wrapper to conditionally show/hide navbar and footer
const LayoutWrapper = () => {
  const location = useLocation();
  const { loading } = useAuth();
  const hideNavbarRoutes = ['/login', '/register'];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/books" element={<BookList />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/categories" element={<Categories />} />
          
          {/* Protected Routes */}
          <Route 
            path="/add-book" 
            element={
              <ProtectedRoute>
                <AddBook />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/edit-book/:id" 
            element={
              <ProtectedRoute>
                <EditBook />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-books" 
            element={
              <ProtectedRoute>
                <MyBooks />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-rejected-books" 
            element={
              <ProtectedRoute>
                <MyRejectedBooks />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/edit-rejected-book/:id" 
            element={
              <ProtectedRoute>
                <EditRejectedBook />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports/updates" 
            element={
              <ProtectedRoute>
                <ReportUpdates />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports/delete-requests" 
            element={
              <ProtectedRoute>
                <DeleteRequests />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!shouldHideNavbar && <Footer />}
    </>
  );
};

function App() {
  // Background effect state from localStorage
  const [backgroundType, setBackgroundType] = useState(() => {
    return localStorage.getItem('backgroundEffect') || 'gradient-wave';
  });
  
  const [backgroundEnabled, setBackgroundEnabled] = useState(() => {
    const saved = localStorage.getItem('backgroundEnabled');
    return saved === null ? true : saved === 'true';
  });

  // Listen for background settings changes
  useEffect(() => {
    const handleSettingsChange = (event) => {
      setBackgroundType(event.detail.backgroundType);
      setBackgroundEnabled(event.detail.enabled);
    };

    window.addEventListener('backgroundSettingsChanged', handleSettingsChange);
    return () => {
      window.removeEventListener('backgroundSettingsChanged', handleSettingsChange);
    };
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="app">
          {/* Background Effect - Dynamic based on user settings */}
          <BackgroundEffect 
            effectType={backgroundType} 
            enabled={backgroundEnabled} 
          />
          
          {/* Background Settings Button (Fixed bottom-right) */}
          <BackgroundSettings />
          
          <LayoutWrapper />
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
