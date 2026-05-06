/**
 * Servicio de Autenticación
 * Maneja login, logout y recuperación de datos del usuario
 */

import { apiPost, apiGet, csrfCookie, API_URL } from './api';

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return decodeURIComponent(match[2]);
  return null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'author' | 'user';
  created_at?: string;
  updated_at?: string;
}

export interface LoginResponse {
  user: User;
}

/**
 * Login - Obtener token
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  // Sin necesidad de CSRF token (está deshabilitado en backend para rutas de auth)
  // Intentamos login por sesión primero
  try {
    const sessionResp = await apiPost<{ user: User }>('/session/login', { email, password });
    const user = (sessionResp as unknown as Record<string, unknown>).user as User | undefined;
    if (user) {
      try { localStorage.setItem('cms_user', JSON.stringify(user)); } catch {}
      return { user } as LoginResponse;
    }
    throw new Error('No user in session response');
  } catch (err) {
    // Si falla sesión, intentamos token login como fallback
    try {
      const apiResp = await apiPost<{ token?: string; user?: User }>('/auth/login', { email, password });
      const body = apiResp as unknown as Record<string, unknown>;
      const token = typeof body.token === 'string' ? (body.token as string) : undefined;
      const user = body.user as User | undefined;
      if (token) try { localStorage.setItem('cms_token', token); } catch {}
      if (user) {
        try { localStorage.setItem('cms_user', JSON.stringify(user)); } catch {}
        return { user } as LoginResponse;
      }
    } catch (e) {
      // fall through to rethrow original error
    }
    throw err;
  }
}

/**
 * Logout - Invalidar token
 */
export async function logout(): Promise<void> {
  // Cerrar sesión por cookie (sin CSRF requerido)
  try {
    await apiPost<{ message: string }>('/session/logout', {});
  } catch (err) {
    console.warn('Error logout session:', err);
  } finally {
    try { localStorage.removeItem('cms_user'); } catch {}
    try { localStorage.removeItem('cms_token'); } catch {}
  }
}

/**
 * Obtener datos del usuario actual
 */
export type CurrentUserResult = {
  user: User | null;
  sessionVerified: boolean;
};

export async function getCurrentUser(token?: string): Promise<CurrentUserResult> {
  // Primero intentar la ruta de sesión (/api/session/me) — requiere cookies y middleware web
  try {
    const resp = await apiGet<User>('/session/me');
    const user = resp as unknown as User | undefined;
    if (user?.id) {
      return { user, sessionVerified: true };
    }
  } catch (e) {
    // ignore and fallback
  }

  // Fallback: usar el endpoint API que soporta bearer token (/api/auth/me)
  try {
    const data = await apiGet<User>('/auth/me', token);
    return { user: data as unknown as User, sessionVerified: false };
  } catch (err) {
    throw err;
  }
}

/**
 * Registrar administrador vía endpoint `/api/register-admin`.
 */
export async function registerAdmin(name: string, email: string, password: string, password_confirmation: string): Promise<User> {
  // Sin verificación CSRF (deshabilitada en backend)
  const res = await apiPost<{ user: User }>('/register-admin', {
    name,
    email,
    password,
    password_confirmation,
  });

  const data = res as unknown as Record<string, unknown>;
  const user = data.user as User | undefined;
  
  if (!user?.id) {
    throw new Error('No user in registration response');
  }

  try { localStorage.setItem('cms_user', JSON.stringify(user)); } catch {}
  return user;
}

/**
 * Solicitar enlace de reseteo (forgot password)
 */
export async function forgotPassword(email: string): Promise<{ message: string }>{
  // Sin CSRF requerido
  const res = await apiPost<{ message: string }>('/auth/forgot-password', { email });
  return res as unknown as { message: string };
}

/**
 * Resetear password usando token recibido por email
 */
export async function resetPassword(token: string, email: string, password: string, password_confirmation: string): Promise<{ message: string }> {
  // Sin CSRF requerido
  const res = await apiPost<{ message: string }>('/auth/reset-password', { token, email, password, password_confirmation });
  return res as unknown as { message: string };
}

/**
 * Verificar si el usuario está autenticado
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('cms_user');
}

/**
 * Obtener usuario del almacenamiento local
 */
export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  const user = localStorage.getItem('cms_user');
  if (!user) return null;
  
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

/**
 * Obtener token del almacenamiento local (compat shim)
 * Durante la migración a autenticación por sesión mantenemos un shim
 * para evitar errores en módulos que aún importen `getStoredToken`.
 */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cms_token');
}

/**
 * Verificar si el usuario tiene un rol específico
 */
export function hasRole(role: string | string[]): boolean {
  const user = getStoredUser();
  if (!user) return false;

  if (Array.isArray(role)) {
    return role.includes(user.role);
  }

  return user.role === role;
}
