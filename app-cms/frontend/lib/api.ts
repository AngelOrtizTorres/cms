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

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

  const url = `${API_URL}${endpoint}`;
  
  // Headers por defecto
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
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
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    // Si la respuesta no es exitosa, lanzar error
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
    // Si es un error de red, lanzar error genérico
    if (error instanceof TypeError) {
      throw {
        status: 0,
        message: 'Error de conexión con el servidor',
        error,
      };
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
  const url = `${API_URL}${endpoint}`;
  
  const headers: Record<string, string> = {};
  
  const authToken = token || getToken();
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
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
