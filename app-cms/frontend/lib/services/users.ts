/**
 * Servicio de Usuarios
 */

import { apiGet, apiPost, apiPut, apiDelete } from '../api';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'author' | 'user';
  created_at: string;
  updated_at: string;
}

export interface UsersPaginatedResponse {
  data: UserProfile[];
  current_page?: number;
  last_page?: number;
  total?: number;
}

/**
 * Obtener lista de usuarios (solo admin)
 */
export async function getUsers(token?: string) {
  const response = await apiGet<UsersPaginatedResponse>('/users', token);
  return (response.data || response) as UsersPaginatedResponse;
}

/**
 * Crear usuario (solo admin)
 */
export async function createUser(
  user: {
    name: string;
    email: string;
    password: string;
    role: string;
  },
  token?: string
) {
  const response = await apiPost<UserProfile>('/users', user, token);
  return (response.data || response) as UserProfile;
}

/**
 * Actualizar usuario
 */
export async function updateUser(
  id: number,
  user: Partial<UserProfile>,
  token?: string
) {
  const response = await apiPut<UserProfile>(`/users/${id}`, user, token);
  return (response.data || response) as UserProfile;
}

/**
 * Eliminar usuario (solo admin)
 */
export async function deleteUser(id: number, token?: string) {
  await apiDelete(`/users/${id}`, token);
}
