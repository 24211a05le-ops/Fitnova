import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, verifySession } from '../services/authService';

const AuthContext = createContext();

const getStorageItem = (key) => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage.getItem(key);
};

const readStoredToken = () => getStorageItem('fitnova_token');

const readStoredUser = () => {
  try {
    const storedUser = getStorageItem('fitnova_user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Failed to parse stored user session:', error);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('fitnova_user');
    }
    return null;
  }
};

const persistAuthSession = (user, token) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem('fitnova_user', JSON.stringify(user));
  window.localStorage.setItem('fitnova_token', token);
};

const clearAuthSession = () => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem('fitnova_user');
  window.localStorage.removeItem('fitnova_token');
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => (readStoredToken() ? readStoredUser() : null));
  const [loading, setLoading] = useState(() => {
    const token = readStoredToken();
    return Boolean(token) && !readStoredUser();
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = readStoredToken();
      if (!token) {
        clearAuthSession();
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const data = await verifySession();
        setUser(data.user);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('fitnova_user', JSON.stringify(data.user));
        }
      } catch (err) {
        console.error('Error loading auth credentials:', err);
        setUser(null);
        clearAuthSession();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const data = await loginUser({ email, password });
      setUser(data.user);
      persistAuthSession(data.user, data.token);
      return data.user;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Login failed';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const data = await registerUser(userData);
      setUser(data.user);
      persistAuthSession(data.user, data.token);
      return data.user;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Registration failed';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    clearAuthSession();
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, error, login, register, logout }}>
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
