import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, verifySession } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('fitnova_token');
        if (token) {
          // Verify with backend
          const data = await verifySession();
          setUser(data.user);
          localStorage.setItem('fitnova_user', JSON.stringify(data.user));
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error loading auth credentials:', err);
        setUser(null);
        localStorage.removeItem('fitnova_user');
        localStorage.removeItem('fitnova_token');
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser({ email, password });
      setUser(data.user);
      localStorage.setItem('fitnova_user', JSON.stringify(data.user));
      localStorage.setItem('fitnova_token', data.token);
      return data.user;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Login failed';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await registerUser(userData);
      setUser(data.user);
      localStorage.setItem('fitnova_user', JSON.stringify(data.user));
      localStorage.setItem('fitnova_token', data.token);
      return data.user;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Registration failed';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem('fitnova_user');
    localStorage.removeItem('fitnova_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
