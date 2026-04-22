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
  featured: boolean;
  status: 'draft' | 'published';
  section_id: number;
  parent_id?: number | null;
  section?: Section;
  parent?: Article;
  tags?: Tag[];
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: number;
  name: string;
  slug: string;
  description: string;
  article_count?: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
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

  return (response.data || response) as PaginatedResponse<Article>;
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
  const response = await apiGet(`/sections/${slug}`);
  return response;
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
  const response = await apiGet(`/tags/${slug}`);
  return response;
}

/**
 * Buscar artículos
 */
export async function searchArticles(query: string, limit: number = 10) {
  const response = await apiGet<Article[]>(
    `/search?q=${encodeURIComponent(query)}&limit=${limit}`
  );
  return (response.data || response) as Article[];
}
