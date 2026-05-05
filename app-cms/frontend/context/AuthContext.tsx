'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, login as apiLogin, logout as apiLogout, getCurrentUser, getStoredUser } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
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

<<<<<<< HEAD
  // Inicializar desde localStorage al montar; si no hay token, intentar cargar usuario por cookie
  useEffect(() => {
    let mounted = true;

    async function init() {
      setLoading(true);

      const storedUser = getStoredUser();
      const storedToken = getStoredToken();

      if (storedToken && storedUser) {
        if (!mounted) return;
        setUser(storedUser);
        setToken(storedToken);
        setLoading(false);
        return;
      }

      // Intentar recuperar usuario vía cookie HttpOnly (backend debe aceptar cookies same-origin)
      if (!storedToken || !storedUser) {
        try {
          const current = await getCurrentUser(storedToken || undefined);
          if (current && mounted) {
            setUser(current);
            try {
              localStorage.setItem('cms_user', JSON.stringify(current));
            } catch (e) {}
          }
        } catch (e) {
          // no autenticado; no mostrar error aquí
        } finally {
          if (mounted) setLoading(false);
        }
      } else {
        if (mounted) setLoading(false);
      }
    }

    init();

    return () => {
      mounted = false;
    };
=======
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
>>>>>>> main
  }, []);

  // Refrescar usuario explícitamente (útil cuando la cookie HttpOnly fue creada por login server-side)
  async function refreshUser() {
    setLoading(true);
    try {
      const storedToken = getStoredToken();
      const current = await getCurrentUser(storedToken || undefined);
      if (current) {
        setUser(current);
        try {
          localStorage.setItem('cms_user', JSON.stringify(current));
        } catch (e) {}
      }
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiLogin(email, password);
      setUser(response.user);
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
      setError(null);
    } catch (err: any) {
      console.error('Error en logout:', err);
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
<<<<<<< HEAD
    refreshUser,
    // Considerar autenticado cuando exista `user` (token puede no estar disponible si se usa cookie HttpOnly)
    isAuthenticated: !!user,
=======
    isAuthenticated: !!user,
    sessionVerified,
>>>>>>> main
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
