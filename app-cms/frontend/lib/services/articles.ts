/**
 * Servicio de Artículos
 */

import { apiGet, apiPost, apiPut, apiDelete } from '../api';

export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string | null;
  gallery_images?: string[] | null;
  featured: boolean;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  meta_title?: string | null;
  meta_description?: string | null;
  section_id: number;
  user_id?: number;
  parent_id?: number | null;
  section?: Section;
  user?: {
    id: number;
    name: string;
    email?: string;
  };
  parent?: Article;
  tags?: Tag[];
  created_at: string;
  updated_at: string;
  published_at?: string | null;
}

export interface Section {
  id: number;
  name: string;
  slug: string;
  description: string;
  active?: boolean;
  position?: number;
  parent_id?: number | null;
  article_count?: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  active?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    total: number;
    per_page: number;
  };
}

/**
 * Obtener lista de artículos paginada
 */
export async function getArticles(params: {
  page?: number;
  per_page?: number;
  sort?: string;
  section_id?: number;
  search?: string;
} = {}) {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page.toString());
  if (params.per_page) query.append('per_page', params.per_page.toString());
  if (params.sort) query.append('sort', params.sort);
  if (params.section_id) query.append('section_id', params.section_id.toString());
  if (params.search) query.append('search', params.search);

  const response = await apiGet<PaginatedResponse<Article>>(
    `/articles?${query.toString()}`
  );

  const direct = response as unknown as PaginatedResponse<Article>;
  if (Array.isArray(direct.data)) {
    return direct;
  }

  const wrapped = response.data as unknown as PaginatedResponse<Article>;
  if (wrapped && Array.isArray(wrapped.data)) {
    return wrapped;
  }

  return {
    data: [],
    meta: {
      current_page: 1,
      total: 0,
      per_page: params.per_page || 10,
    },
  };
}

/**
 * Obtener artículos destacados
 */
export async function getFeaturedArticles(limit: number = 6) {
  const response = await apiGet<Article[]>(`/articles/featured?limit=${limit}`);
  return (response.data || response) as Article[];
}

/**
 * Obtener un artículo por slug
 */
export async function getArticleBySlug(slug: string) {
  const response = await apiGet<Article>(`/articles/${slug}`);
  return (response.data || response) as Article;
}

/**
 * Crear artículo
 */
export async function createArticle(article: Partial<Article>, token?: string) {
  const response = await apiPost<Article>('/articles', article, token);
  return (response.data || response) as Article;
}

/**
 * Actualizar artículo
 */
export async function updateArticle(id: number, article: Partial<Article>, token?: string) {
  const response = await apiPut<Article>(`/articles/${id}`, article, token);
  return (response.data || response) as Article;
}

/**
 * Eliminar artículo
 */
export async function deleteArticle(id: number, token?: string) {
  await apiDelete(`/articles/${id}`, token);
}

/**
 * Obtener secciones
 */
export async function getSections() {
  const response = await apiGet<Section[]>('/sections');
  return (response.data || response) as Section[];
}

/**
 * Obtener artículos de una sección
 */
export async function getArticlesBySection(slug: string) {
  const response = await apiGet<Section>(`/sections/${slug}`);
  return (response.data || response) as Section;
}

/**
 * Obtener etiquetas
 */
export async function getTags() {
  const response = await apiGet<Tag[]>('/tags');
  return (response.data || response) as Tag[];
}

/**
 * Obtener artículos por etiqueta
 */
export async function getArticlesByTag(slug: string) {
  const response = await apiGet<Tag>(`/tags/${slug}`);
  return (response.data || response) as Tag;
}

/**
 * Buscar artículos
 */
export async function searchArticles(query: string, per_page: number = 10) {
  const response = await apiGet<Article[]>(
    `/search?q=${encodeURIComponent(query)}&per_page=${per_page}`
  );
  return (response.data || response) as Article[];
}

/**
 * Crear sección
 */
export async function createSection(section: Partial<Section>, token?: string) {
  const response = await apiPost<Section>('/sections', section, token);
  return (response.data || response) as Section;
}

/**
 * Actualizar sección
 */
export async function updateSection(id: number, section: Partial<Section>, token?: string) {
  const response = await apiPut<Section>(`/sections/${id}`, section, token);
  return (response.data || response) as Section;
}

/**
 * Eliminar sección
 */
export async function deleteSection(id: number, token?: string) {
  return apiDelete(`/sections/${id}`, token);
}

/**
 * Crear etiqueta
 */
export async function createTag(tag: Partial<Tag>, token?: string) {
  const response = await apiPost<Tag>('/tags', tag, token);
  return (response.data || response) as Tag;
}

/**
 * Actualizar etiqueta
 */
export async function updateTag(id: number, tag: Partial<Tag>, token?: string) {
  const response = await apiPut<Tag>(`/tags/${id}`, tag, token);
  return (response.data || response) as Tag;
}

/**
 * Eliminar etiqueta
 */
export async function deleteTag(id: number, token?: string) {
  return apiDelete(`/tags/${id}`, token);
}
