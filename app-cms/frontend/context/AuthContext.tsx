'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, login as apiLogin, logout as apiLogout, getCurrentUser, getStoredUser } from '@/lib/auth';
import { normalizeApiError } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  // Indica si la sesión fue verificada por el backend (/session/me)
  sessionVerified: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionVerified, setSessionVerified] = useState(false);

  // Inicializar: preferir sesión (consulta al backend), fallback a token/localStorage
  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      const storedUser = getStoredUser();

      try {
        const result = await getCurrentUser();
        if (!mounted) return;
        setUser(result.user ?? null);
        setSessionVerified(!!result.sessionVerified);
        try { if (result.user) localStorage.setItem('cms_user', JSON.stringify(result.user)); } catch {}
      } catch (err) {
        if (!mounted) return;
        // fallback: usar usuario en localStorage si existe
        if (storedUser) {
          setUser(storedUser);
          setSessionVerified(false);
        } else {
          setUser(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiLogin(email, password);
      setUser(response.user);
    } catch (err: unknown) {
      const parsed = normalizeApiError(err);
      const errorMessage = parsed?.message || 'Error en login';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);

    try {
      await apiLogout();
      setUser(null);
      setError(null);
    } catch (err: unknown) {
      const parsed = normalizeApiError(err);
      console.error('Error en logout:', parsed);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    sessionVerified,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
