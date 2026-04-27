/**
 * Servicio de Banners y Configuración
 */

import { apiGet, apiPost, apiPut, apiDelete } from '../api';

export interface Banner {
  id: number;
  title: string;
  image_url: string;
  link_url: string;
  position: 'header' | 'sidebar' | 'between_articles' | 'footer';
  active: boolean;
  created_at: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  phone_number?: string;
  created_at: string;
}

export interface Settings {
  site_name: string;
  site_description: string;
  logo_url: string;
  favicon_url: string;
  contact_email: string;
  social_media: Record<string, string>;
}

export interface HomepageConfig {
  featured_articles: number;
  latest_articles: number;
  sections_displayed: number[];
  banners_enabled: boolean;
}

/**
 * Obtener banners
 */
export async function getBanners() {
  const response = await apiGet<Banner[]>('/banners');
  return (response.data || response) as Banner[];
}

/**
 * Obtener banners por posición
 */
export async function getBannersByPosition(position: string) {
  const response = await apiGet<Banner[]>(`/banners/${position}`);
  return (response.data || response) as Banner[];
}

/**
 * Crear banner
 */
export async function createBanner(banner: Partial<Banner>, token?: string) {
  const response = await apiPost<Banner>('/banners', banner, token);
  return (response.data || response) as Banner;
}

/**
 * Actualizar banner
 */
export async function updateBanner(id: number, banner: Partial<Banner>, token?: string) {
  const response = await apiPut<Banner>(`/banners/${id}`, banner, token);
  return (response.data || response) as Banner;
}

/**
 * Eliminar banner
 */
export async function deleteBanner(id: number, token?: string) {
  await apiDelete(`/banners/${id}`, token);
}

/**
 * Enviar mensaje de contacto (público)
 */
export async function sendContactMessage(message: {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone_number?: string;
  source_url?: string;
  privacy_accepted: boolean;
}) {
  const response = await apiPost('/contact', message);
  return response;
}

/**
 * Obtener mensajes de contacto (solo admin)
 */
export async function getContactMessages(token?: string) {
  const response = await apiGet<ContactMessage[]>('/contact/messages', token);
  return (response.data || response) as ContactMessage[];
}

/**
 * Eliminar mensaje de contacto (solo admin)
 */
export async function deleteContactMessage(id: number, token?: string) {
  await apiDelete(`/contact/messages/${id}`, token);
}

/**
 * Obtener configuración general
 */
export async function getSettings() {
  const response = await apiGet<Settings>('/settings');
  return (response.data || response) as Settings;
}

/**
 * Actualizar configuración (solo admin)
 */
export async function updateSettings(settings: Partial<Settings>, token?: string) {
  const response = await apiPut<Settings>('/settings', settings, token);
  return (response.data || response) as Settings;
}

/**
 * Obtener configuración de portada
 */
export async function getHomepageConfig() {
  const response = await apiGet<HomepageConfig>('/homepage');
  return (response.data || response) as HomepageConfig;
}

/**
 * Actualizar configuración de portada (solo admin)
 */
export async function updateHomepageConfig(config: Partial<HomepageConfig>, token?: string) {
  const response = await apiPut<HomepageConfig>('/homepage', config, token);
  return (response.data || response) as HomepageConfig;
}
