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
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: any;
  token?: string;
}

// URL base de la API con fallback para entornos locales
const DEFAULT_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://localhost:8000";
const API_URL = DEFAULT_API_URL.replace(/\/$/, "");

/**
 * Obtiene el token del almacenamiento local
 */
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("cms_token");
}

/**
 * Realiza una petición HTTP a la API
 */
export async function apiCall<T = any>(
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

  // Agregar token si existe
  const authToken = token || getToken();
  if (authToken) {
    defaultHeaders["Authorization"] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const contentType = response.headers.get("content-type") || "";
    let data: any = null;

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
      data = { data: text } as any;
    }

    // Si la respuesta no es exitosa y el body es JSON, lanzar error con el mensaje adecuado
    if (!response.ok) {
      throw {
        status: response.status,
        message: data?.message || "Error en la solicitud",
        errors: data?.errors,
        data,
      };
    }

    return data;
  } catch (error: any) {
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
export function apiGet<T = any>(endpoint: string, token?: string) {
  return apiCall<T>(endpoint, { method: "GET", token });
}

/**
 * POST - Crear datos
 */
export function apiPost<T = any>(endpoint: string, body: any, token?: string) {
  return apiCall<T>(endpoint, { method: "POST", body, token });
}

/**
 * PUT - Actualizar datos
 */
export function apiPut<T = any>(endpoint: string, body: any, token?: string) {
  return apiCall<T>(endpoint, { method: "PUT", body, token });
}

/**
 * DELETE - Eliminar datos
 */
export function apiDelete<T = any>(endpoint: string, token?: string) {
  return apiCall<T>(endpoint, { method: "DELETE", token });
}

/**
 * POST multipart - Para subir archivos
 */
export async function apiPostFormData<T = any>(
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

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    const contentType = response.headers.get("content-type") || "";
    let data: any = null;

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
      data = { data: text } as any;
    }

    if (!response.ok) {
      throw {
        status: response.status,
        message: data?.message || "Error en la solicitud",
        errors: data?.errors,
        data,
      };
    }

    return data;
  } catch (error: any) {
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
