import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          setPreferences(res.data.preferences);
        }
      } catch (err) {
        // Not logged in or expired token
        setUser(null);
        setPreferences(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      if (res.data.token) {
        localStorage.setItem('ascendos_token', res.data.token);
      }
      setUser(res.data.user);
      // Fetch full preferences
      const meRes = await api.get('/auth/me');
      if (meRes.data.success) {
        setPreferences(meRes.data.preferences);
      }
      return res.data;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout note:', err.message);
    } finally {
      localStorage.removeItem('ascendos_token');
      setUser(null);
      setPreferences(null);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const updatePreferences = (updatedPrefs) => {
    setPreferences(updatedPrefs);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        preferences,
        loading,
        login,
        logout,
        updateUser,
        updatePreferences,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
