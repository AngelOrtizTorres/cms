/**
 * Servicio de Autenticación
 * Maneja login, logout y recuperación de datos del usuario
 */

import { apiPost, apiGet, ApiError } from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  roles?: Array<{ id: number; name: string }>;
  role?: 'admin' | 'editor' | 'author' | 'user';
  created_at?: string;
  updated_at?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

/**
 * Login - Obtener token
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await apiPost<LoginResponse>('/auth/login', {
    email,
    password,
  });

  if (response.token) {
    // Guardar token y usuario en localStorage
    localStorage.setItem('cms_token', response.token);
    localStorage.setItem('cms_user', JSON.stringify(response.user));
  }

  return {
    token: response.token,
    user: response.user,
  };
}

/**
 * Logout - Invalidar token
 */
export async function logout(): Promise<void> {
  try {
    await apiPost('/auth/logout', {});
  } catch (error: unknown) {
    const apiError = error as Partial<ApiError>;
    const status = typeof apiError?.status === 'number' ? apiError.status : undefined;

    // Logout can be called when token/session already expired.
    if (status !== 401 && status !== 419) {
      const message = apiError?.message || 'Error desconocido en logout';
      console.error('Error en logout:', { status, message, data: apiError?.data });
    }
  } finally {
    // Limpiar localStorage
    localStorage.removeItem('cms_token');
    localStorage.removeItem('cms_user');
  }
}

/**
 * Obtener datos del usuario actual
 */
export async function getCurrentUser(token?: string): Promise<User> {
  const response = await apiGet<User>('/auth/me', token);
  // El API devuelve directamente el objeto User, o envuelto en { data: User }
  const user = (response.data || response) as User;

  if (!user.role && user.roles && user.roles.length > 0) {
    user.role = user.roles[0].name as User['role'];
  }

  return user;
}

/**
 * Verificar si el usuario está autenticado
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('cms_token');
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
 * Obtener token del almacenamiento local
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
  if (!user || !user.role) return false;

  if (Array.isArray(role)) {
    return role.includes(user.role);
  }

  return user.role === role;
}
