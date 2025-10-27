import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await login(formData.email, formData.password);
      
      console.log('User login response:', response);
      
      // Check user role and redirect accordingly
      const user = response?.user;
      
      if (!user) {
        toast.error('Login failed: Invalid response from server');
        return;
      }
      
      if (user.role === 'admin') {
        // Admins cannot login to user portal
        localStorage.removeItem('token');
        toast.error('Admin vui lòng đăng nhập tại trang quản trị');
        return;
      }
      
      // Redirect to books list page for regular users
      navigate('/books');
      toast.success(`Welcome back, ${user.name}!`);
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-brand">
            <i className="fas fa-book-reader"></i>
            <h1>BookLibrary</h1>
            <p>Your Gateway to Knowledge</p>
          </div>
          <div className="login-illustration">
            <i className="fas fa-books"></i>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-wrapper">
            <div className="login-header">
              <h2>Welcome Back!</h2>
              <p>Sign in to continue to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">
                  <i className="fas fa-envelope"></i> Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <i className="fas fa-lock"></i> Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    className="form-control"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <a href="#" className="forgot-password">Forgot password?</a>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Signing in...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt"></i> Sign In
                  </>
                )}
              </button>

              <div className="divider">
                <span>or</span>
              </div>

              <div className="social-login">
                <button type="button" className="btn-social btn-google">
                  <i className="fab fa-google"></i> Sign in with Google
                </button>
                <button type="button" className="btn-social btn-facebook">
                  <i className="fab fa-facebook-f"></i> Sign in with Facebook
                </button>
              </div>

              <div className="signup-link">
                Don't have an account? <Link to="/register">Sign up now</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
