/**
 * Cliente HTTP para comunicarse con la API Laravel
 * Maneja autenticación, errores y transformaciones de datos
 */

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  [key: string]: any;
}

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  token?: string;
}

export interface ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;
  data?: any;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api').replace(/\/$/, '');

function createApiError(payload: {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
  data?: any;
  cause?: unknown;
}): ApiError {
  const err = new Error(payload.message) as ApiError;
  err.name = 'ApiError';
  err.status = payload.status;
  err.errors = payload.errors;
  err.data = payload.data;
  if (payload.cause !== undefined) {
    (err as Error & { cause?: unknown }).cause = payload.cause;
  }
  return err;
}

/**
 * Obtiene el token del almacenamiento local
 */
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cms_token');
}

/**
 * Realiza una petición HTTP a la API
 */
export async function apiCall<T = any>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body,
    token,
  } = config;

  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_URL}${normalizedEndpoint}`;
  
  // Headers por defecto
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...headers,
  };

  // Agregar token si existe
  const authToken = token || getToken();
  if (authToken) {
    defaultHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      method,
      credentials: 'include',
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Intentar parsear JSON; si viene HTML u otro contenido, capturarlo como texto
    const contentType = response.headers.get('content-type') || '';
    let data: any = null;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { raw: text };
      }
    }

    // Si la respuesta no es exitosa, lanzar error con detalle (incluye texto bruto si no es JSON)
    if (!response.ok) {
      throw createApiError({
        status: response.status,
        message: (data && data.message) || 'Error en la solicitud',
        errors: data && data.errors,
        data,
      });
    }

    return data;
  } catch (error: any) {
    // Si es un error de red, lanzar error genérico
    if (error instanceof TypeError) {
      throw createApiError({
        status: 0,
        message: 'Error de conexión con el servidor',
        cause: error,
      });
    }

    // Re-lanzar errores conocidos
    throw error;
  }
}

/**
 * GET - Obtener datos
 */
export function apiGet<T = any>(endpoint: string, token?: string) {
  return apiCall<T>(endpoint, { method: 'GET', token });
}

/**
 * POST - Crear datos
 */
export function apiPost<T = any>(endpoint: string, body: any, token?: string) {
  return apiCall<T>(endpoint, { method: 'POST', body, token });
}

/**
 * PUT - Actualizar datos
 */
export function apiPut<T = any>(endpoint: string, body: any, token?: string) {
  return apiCall<T>(endpoint, { method: 'PUT', body, token });
}

/**
 * DELETE - Eliminar datos
 */
export function apiDelete<T = any>(endpoint: string, token?: string) {
  return apiCall<T>(endpoint, { method: 'DELETE', token });
}

/**
 * POST multipart - Para subir archivos
 */
export async function apiPostFormData<T = any>(
  endpoint: string,
  formData: FormData,
  token?: string
): Promise<ApiResponse<T>> {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_URL}${normalizedEndpoint}`;
  
  const headers: Record<string, string> = {};
  
  const authToken = token || getToken();
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || 'Error en la solicitud',
        errors: data.errors,
        data,
      };
    }

    return data;
  } catch (error: any) {
    if (error instanceof TypeError) {
      throw {
        status: 0,
        message: 'Error de conexión con el servidor',
        error,
      };
    }
    throw error;
  }
}
