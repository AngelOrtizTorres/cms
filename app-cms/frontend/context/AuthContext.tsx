'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, login as apiLogin, logout as apiLogout, getCurrentUser, getStoredUser, getStoredToken } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inicializar desde localStorage al montar
  useEffect(() => {
    const storedUser = getStoredUser();
    const storedToken = getStoredToken();

    if (storedToken && storedUser) {
      setUser(storedUser);
      setToken(storedToken);
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiLogin(email, password);
      setUser(response.user);
      setToken(response.token);
    } catch (err: any) {
      const errorMessage = err?.message || 'Error en login';
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
      setToken(null);
      setError(null);
    } catch (err: any) {
      console.error('Error en logout:', err);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!token && !!user,
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
