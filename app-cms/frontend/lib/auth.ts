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
  // Petición al endpoint CSRF (Sanctum) para asegurar cookie XSRF-TOKEN
  try {
    await csrfCookie();
  } catch (err) {
    // No bloqueamos el login por si el backend no usa Sanctum; solo avisamos
    console.warn('No se pudo obtener cookie CSRF (sanctum), continuando...', err);
  }

  // Flujo por sesión (Sanctum) - backend debe exponer /session/login
  const xsrf = getCookieValue('XSRF-TOKEN');

  const sessionResp = await fetch(`${API_URL}/session/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(xsrf ? { 'X-XSRF-TOKEN': xsrf } : {}),
    },
    body: JSON.stringify({ email, password }),
  });

  if (!sessionResp.ok) {
    const text = await sessionResp.text();
    throw { status: sessionResp.status, message: text || 'Error en login por sesión' };
  }

  const data = await sessionResp.json();
  try { localStorage.setItem('cms_user', JSON.stringify(data.user)); } catch {}
  return { user: data.user } as LoginResponse;
}

/**
 * Logout - Invalidar token
 */
export async function logout(): Promise<void> {
  // Cerrar sesión por cookie (Sanctum)
  try {
    try { await csrfCookie(); } catch {}

    await fetch(`${API_URL}/session/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({}),
    });
  } catch (err) {
    console.warn('Error logout session:', err);
  } finally {
    try { localStorage.removeItem('cms_user'); } catch {}
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
  // Primero intentar la ruta de sesión (web route) — requiere cookies y middleware web
  try {
    const resp = await fetch(`${API_URL}/session/me`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (resp.ok) {
      const data = await resp.json();
      return { user: data as User, sessionVerified: true };
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
 * Registrar administrador vía endpoint web personalizado `/register-admin`.
 */
export async function registerAdmin(name: string, email: string, password: string, password_confirmation: string): Promise<User> {
  try {
    await csrfCookie();
  } catch {}

  const xsrf = getCookieValue('XSRF-TOKEN');

  const res = await fetch(`${API_URL}/register-admin`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(xsrf ? { 'X-XSRF-TOKEN': xsrf } : {}),
    },
    body: JSON.stringify({ name, email, password, password_confirmation }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw { status: res.status, message: text || 'Error en registro' };
  }

  const data = await res.json();
  try { localStorage.setItem('cms_user', JSON.stringify(data.user)); } catch {}
  return data.user as User;
}

/**
 * Solicitar enlace de reseteo (forgot password)
 */
export async function forgotPassword(email: string): Promise<{ message: string }>{
  try {
    await csrfCookie();
  } catch {}

  const res = await apiPost<{ message: string }>('/auth/forgot-password', { email });
  return res as any;
}

/**
 * Resetear password usando token recibido por email
 */
export async function resetPassword(token: string, email: string, password: string, password_confirmation: string): Promise<{ message: string }> {
  try {
    await csrfCookie();
  } catch {}

  const res = await apiPost<{ message: string }>('/auth/reset-password', { token, email, password, password_confirmation });
  return res as any;
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
