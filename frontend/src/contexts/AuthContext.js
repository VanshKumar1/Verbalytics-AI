import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const persistToken = useCallback((nextToken) => {
    if (nextToken) localStorage.setItem('token', nextToken);
    else localStorage.removeItem('token');
    setToken(nextToken);
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setAuthError(null);
    try {
      const res = await api.get('/api/auth/profile');
      setUser(res.data?.data?.user || null);
    } catch (err) {
      setUser(null);
      setAuthError(err?.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // If we already have a token stored, try to hydrate profile.
    if (token && !user) fetchProfile();
  }, [token, user, fetchProfile]);

  const login = useCallback(async ({ identifier, password }) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await api.post('/api/auth/login', { identifier, password });
      const nextToken = res.data?.data?.token;
      if (!nextToken) throw new Error('Token not returned by backend');
      persistToken(nextToken);
      setUser(res.data?.data?.user || null);
      return { token: nextToken, user: res.data?.data?.user || null };
    } catch (err) {
      const message = err?.response?.data?.message || 'Login failed';
      setAuthError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [persistToken]);

  const register = useCallback(async ({ username, email, password, firstName, lastName, profile }) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await api.post('/api/auth/register', {
        username,
        email,
        password,
        firstName,
        lastName,
        profile,
      });
      const nextToken = res.data?.data?.token;
      if (!nextToken) throw new Error('Token not returned by backend');
      persistToken(nextToken);
      setUser(res.data?.data?.user || null);
      return { token: nextToken, user: res.data?.data?.user || null };
    } catch (err) {
      const message = err?.response?.data?.message || 'Registration failed';
      setAuthError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [persistToken]);

  const logout = useCallback(async () => {
    // Backend logout clears refresh cookie; we still clear local token.
    setLoading(true);
    setAuthError(null);
    try {
      await api.post('/api/auth/logout');
    } catch {
      // ignore
    } finally {
      persistToken(null);
      setUser(null);
      setLoading(false);
    }
  }, [persistToken]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      authError,
      fetchProfile,
      login,
      register,
      logout,
    }),
    [token, user, loading, authError, fetchProfile, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

