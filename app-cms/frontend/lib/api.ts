/**
 * Cliente HTTP para comunicarse con la API Laravel
 * Maneja autenticación, errores y transformaciones de datos
 */

interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  [key: string]: unknown;
}

interface RequestConfig {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  token?: string;
  // Controla el envío de cookies/credenciales. Por defecto se incluye ('include').
  credentials?: RequestCredentials;
}

// URL base de la API con fallback para entornos locales
const DEFAULT_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://localhost:8000";
export const API_URL = DEFAULT_API_URL.replace(/\/$/, "");

// token-based local storage removed; prefer session cookies (Sanctum)

// Obtener token legacy del almacenamiento local (compatibilidad)
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('cms_token');
  } catch {
    return null;
  }
}

/**
 * Realiza una petición HTTP a la API
 */
export async function apiCall<T = unknown>(
  endpoint: string,
  config: RequestConfig = {},
): Promise<ApiResponse<T>> {
  const { method = "GET", headers = {}, body, token } = config;

  const normalizedEndpoint = endpoint.startsWith("/api")
    ? endpoint
    : `/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const url = `${API_URL}${normalizedEndpoint}`;

  // Headers por defecto
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
    ...headers,
  };

  // Agregar token si se pasó explícitamente (retrocompatibilidad)
  const authToken = token || getToken();
  if (authToken) {
    defaultHeaders["Authorization"] = `Bearer ${authToken}`;
  }

  // Si existe la cookie XSRF-TOKEN (establecida por /sanctum/csrf-cookie),
  // envíala en el header `X-XSRF-TOKEN` para que Laravel la valide.
  function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return decodeURIComponent(match[2]);
    return null;
  }

  // (La función getToken está definida a nivel de módulo)

  const xsrf = getCookie('XSRF-TOKEN');
  if (xsrf && !defaultHeaders['X-XSRF-TOKEN'] && !defaultHeaders['X-CSRF-TOKEN']) {
    defaultHeaders['X-XSRF-TOKEN'] = xsrf;
  }

  try {
    const response = await fetch(url, {
      method,
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
      credentials: config.credentials ?? 'include',
    });

    const contentType = response.headers.get("content-type") || "";
    let data: unknown = null;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      // Si no es JSON, intentar leer como texto (evita 'Unexpected token <')
      const text = await response.text();
      // Si la respuesta no es JSON y además no es exitosa, propagamos un error legible
      if (!response.ok) {
        throw {
          status: response.status,
          message:
            text?.length > 0
              ? `Respuesta no-JSON del servidor: ${text.substring(0, 400)}`
              : "Respuesta inesperada del servidor",
          raw: text,
        };
      }
      // Si es 2xx pero no JSON, devolvemos el texto en la propiedad `data`
      data = { data: text } as unknown;
    }

    // Si la respuesta no es exitosa y el body es JSON, lanzar error con el mensaje adecuado
    if (!response.ok) {
      const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
      const message = isRecord(data) && typeof (data as Record<string, unknown>).message === 'string'
        ? (data as Record<string, unknown>).message as string
        : 'Error en la solicitud';
      const errors = isRecord(data) && isRecord((data as Record<string, unknown>).errors)
        ? (data as Record<string, unknown>).errors as Record<string, unknown>
        : null;
      throw {
        status: response.status,
        message,
        errors,
        data,
      };
    }

    return data as ApiResponse<T>;
  } catch (error: unknown) {
    // Si es un error de red, lanzar error genérico
    if (error instanceof TypeError) {
      throw {
        status: 0,
        message: "Error de conexión con el servidor",
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
export function apiGet<T = unknown>(endpoint: string, token?: string) {
  return apiCall<T>(endpoint, { method: "GET", token });
}

/**
 * POST - Crear datos
 */
export function apiPost<T = unknown>(endpoint: string, body: unknown, token?: string) {
  return apiCall<T>(endpoint, { method: "POST", body, token });
}

/**
 * PUT - Actualizar datos
 */
export function apiPut<T = unknown>(endpoint: string, body: unknown, token?: string) {
  return apiCall<T>(endpoint, { method: "PUT", body, token });
}

/**
 * DELETE - Eliminar datos
 */
export function apiDelete<T = unknown>(endpoint: string, token?: string) {
  return apiCall<T>(endpoint, { method: "DELETE", token });
}

/**
 * POST multipart - Para subir archivos
 */
export async function apiPostFormData<T = unknown>(
  endpoint: string,
  formData: FormData,
  token?: string,
): Promise<ApiResponse<T>> {
  const normalizedEndpoint = endpoint.startsWith("/api")
    ? endpoint
    : `/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const url = `${API_URL}${normalizedEndpoint}`;

  const headers: Record<string, string> = {};

  const authToken = token || getToken();
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  // Aceptar JSON por defecto para respuestas FormData también
  headers["Accept"] = "application/json";
  headers["X-Requested-With"] = "XMLHttpRequest";

  // Leer cookie XSRF-TOKEN y añadir header X-XSRF-TOKEN si existe
  function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return decodeURIComponent(match[2]);
    return null;
  }
  const xsrf = getCookie('XSRF-TOKEN');
  if (xsrf) {
    headers['X-XSRF-TOKEN'] = xsrf;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
      credentials: token ? 'include' : 'include',
    });

    const contentType = response.headers.get("content-type") || "";
    let data: unknown = null;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      if (!response.ok) {
        throw {
          status: response.status,
          message:
            text?.length > 0
              ? `Respuesta no-JSON del servidor: ${text.substring(0, 400)}`
              : "Respuesta inesperada del servidor",
          raw: text,
        };
      }
      data = { data: text } as unknown;
    }

    if (!response.ok) {
      const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
      const message = isRecord(data) && typeof (data as Record<string, unknown>).message === 'string'
        ? (data as Record<string, unknown>).message as string
        : 'Error en la solicitud';
      const errors = isRecord(data) && isRecord((data as Record<string, unknown>).errors)
        ? (data as Record<string, unknown>).errors as Record<string, unknown>
        : null;
      throw {
        status: response.status,
        message,
        errors,
        data,
      };
    }

    return data as ApiResponse<T>;
  } catch (error: unknown) {
    if (error instanceof TypeError) {
      throw {
        status: 0,
        message: "Error de conexión con el servidor",
        error,
      };
    }
    throw error;
  }
}

/**
 * Solicita la cookie CSRF de Laravel (Sanctum) para flujos SPA.
 * Llama a `/sanctum/csrf-cookie` en el backend y asegura que la cookie
 * `XSRF-TOKEN` sea establecida (fetch usa `credentials: 'include'`).
 */
export async function csrfCookie(): Promise<void> {
  // Hacemos una petición GET directa a /sanctum/csrf-cookie (no bajo /api)
  await fetch(`${API_URL}/sanctum/csrf-cookie`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      Accept: 'application/json',
    },
  });
}

/**
 * Normaliza distintos formatos de error lanzados por `apiCall` o por fetch
 * y devuelve un objeto con propiedades comunes para el cliente.
 */
export function normalizeApiError(error: unknown): { status?: number | null; message: string; errors?: Record<string, unknown> | null; raw?: unknown } {
  if (!error) return { message: "Error desconocido" };
  if (typeof error === "string") return { message: error };
  if (error instanceof Error) {
    return { status: null, message: error.message, raw: undefined };
  }

  const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
  if (isRecord(error)) {
    const errRec = error as Record<string, unknown>;
    const status = typeof errRec.status === 'number' ? (errRec.status as number) : (isRecord(errRec.data) && typeof (errRec.data as Record<string, unknown>).status === 'number' ? ((errRec.data as Record<string, unknown>).status as number) : null);
    const message = typeof errRec.message === 'string' ? errRec.message : (isRecord(errRec.data) && typeof (errRec.data as Record<string, unknown>).message === 'string' ? ((errRec.data as Record<string, unknown>).message as string) : 'Error en la solicitud');
    const errors = isRecord(errRec.errors) ? (errRec.errors as Record<string, unknown>) : (isRecord(errRec.data) && isRecord((errRec.data as Record<string, unknown>).errors) ? ((errRec.data as Record<string, unknown>).errors as Record<string, unknown>) : null);
    const raw = errRec.raw ?? errRec.data ?? errRec;
    return { status, message, errors, raw };
  }

  return { message: String(error) };
}
