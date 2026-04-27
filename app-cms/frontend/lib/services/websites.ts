/**
 * Servicio de Websites (frontend)
 * Intenta llamar a la API /websites; si falla, usa un fallback en localStorage.
 */

import { apiGet, apiPost } from '../api';

export interface Website {
  id: number;
  name: string;
  url: string;
  owner?: string;
  created_at?: string;
  updated_at?: string;
}

const LOCAL_KEY = 'local_websites';

function readLocal(): Website[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Website[];
  } catch {
    return [];
  }
}

function saveLocal(list: Website[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  } catch {}
}

const sample: Website[] = [
  { id: 1, name: 'Mi sitio principal', url: 'https://example.com', owner: 'Admin', created_at: new Date().toISOString() },
  { id: 2, name: 'Blog', url: 'https://blog.example.com', owner: 'Editor', created_at: new Date().toISOString() },
];

export async function getWebsites(token?: string): Promise<Website[]> {
  try {
    const res = await apiGet<any>('/websites', token);
    if (Array.isArray(res)) return res as Website[];
    if (res && res.data) return res.data as Website[];
    return [];
  } catch (err) {
    // Fallback local
    const local = readLocal();
    if (local.length > 0) return local;
    return sample;
  }
}

export async function createWebsite(payload: Partial<Website>, token?: string): Promise<Website> {
  try {
    const res = await apiPost<any>('/websites', payload, token);
    // si la API devuelve el objeto creado
    if (res && res.data) return res.data as Website;
    if (res && typeof res === 'object') return res as Website;
    // fallback: crear localmente
  } catch (err) {
    // seguir con fallback local
  }

  // Fallback local creation
  const local = readLocal();
  const id = Date.now();
  const created: Website = {
    id,
    name: payload.name || `Sitio ${id}`,
    url: payload.url || '',
    owner: payload.owner || 'unknown',
    created_at: new Date().toISOString(),
  };
  const next = [created, ...local];
  saveLocal(next);
  return created;
}

export async function getWebsiteById(id: number | string): Promise<Website | null> {
  const list = await getWebsites();
  const found = list.find((w) => String(w.id) === String(id));
  return found || null;
}

export async function deleteWebsiteLocal(id: number | string) {
  const list = readLocal();
  const next = list.filter((w) => String(w.id) !== String(id));
  saveLocal(next);
}

export default {
  getWebsites,
  createWebsite,
  getWebsiteById,
  deleteWebsiteLocal,
};
