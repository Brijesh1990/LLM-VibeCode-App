import React, { createContext, useCallback, useEffect, useState } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('lms_access_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const profile = await authService.getMe();
      setUser(profile);
    } catch {
      localStorage.removeItem('lms_access_token');
      localStorage.removeItem('lms_refresh_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    localStorage.setItem('lms_access_token', data.access_token);
    localStorage.setItem('lms_refresh_token', data.refresh_token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const data = await authService.register(payload);
    localStorage.setItem('lms_access_token', data.access_token);
    localStorage.setItem('lms_refresh_token', data.refresh_token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('lms_refresh_token');
    try {
      await authService.logout(refreshToken);
    } catch {
      // Ignore network errors during logout cleanup
    } finally {
      localStorage.removeItem('lms_access_token');
      localStorage.removeItem('lms_refresh_token');
      setUser(null);
    }
  };

  const refreshProfile = async () => {
    const profile = await authService.getMe();
    setUser(profile);
    return profile;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
