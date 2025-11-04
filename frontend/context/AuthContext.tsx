'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../services/api';
import type { AuthContextValue, AuthResponse, Credentials, RegistrationPayload } from '../types/auth';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'slotswapper.auth';

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [initialising, setInitialising] = useState(true);

  // Restore the persisted session on boot so protected routes are usable on refresh.
  useEffect(() => {
    const stored = globalThis.window?.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: AuthResponse = JSON.parse(stored);
        setToken(parsed.token);
        setUser(parsed.user);
      } catch (error) {
        console.warn('Failed to parse persisted session', error);
        globalThis.window?.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setInitialising(false);
  }, []);

  const persistSession = useCallback((payload: AuthResponse | null) => {
    if (!globalThis.window) return;
    if (payload) {
      globalThis.window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } else {
      globalThis.window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback(async (credentials: Credentials) => {
    const response = await apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    setToken(response.token);
    setUser(response.user);
    persistSession(response);
  }, [persistSession]);

  const register = useCallback(async (payload: RegistrationPayload) => {
    const response = await apiRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    setToken(response.token);
    setUser(response.user);
    persistSession(response);
  }, [persistSession]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    persistSession(null);
  }, [persistSession]);

  const value = useMemo<AuthContextValue>(() => ({
    token,
    user,
    initialising,
    isAuthenticated: Boolean(token),
    login,
    register,
    logout
  }), [initialising, login, logout, register, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return ctx;
};
