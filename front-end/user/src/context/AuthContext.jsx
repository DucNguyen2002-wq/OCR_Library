import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Set token in header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/auth/me');
      
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        // Only remove token if explicitly unauthorized
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // Only remove token on 401 (Unauthorized), keep it for other errors
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', {
      username: email,
      password
    });
    
    if (response.data.success) {
      const token = response.data.token;
      localStorage.setItem('token', token);
      
      // Set token in header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(response.data.user);
      return { success: true, user: response.data.user };
    }
    return { success: false, error: response.data.error };
  };

  const register = async (fullname, email, password) => {
    const response = await api.post('/auth/register', {
      fullname,
      email,
      password
    });
    
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
