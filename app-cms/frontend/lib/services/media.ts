/**
 * Servicio de Multimedia
 */

import { apiPostFormData, apiGet, apiDelete } from '../api';

export interface MediaFile {
  id: number;
  filename: string;
  url: string;
  size: number;
  type: string;
  created_at: string;
}

/**
 * Listar archivos (solo usuario autenticado)
 */
export async function getMediaFiles(token?: string) {
  const response = await apiGet<MediaFile[]>('/media', token);
  return (response.data || response) as MediaFile[];
}

/**
 * Subir archivo
 */
export async function uploadMedia(file: File, token?: string) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiPostFormData<MediaFile>('/media', formData, token);
  return (response.data || response) as MediaFile;
}

/**
 * Eliminar archivo
 */
export async function deleteMedia(id: number, token?: string) {
  await apiDelete(`/media/${id}`, token);
}
