'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

type EndpointItem = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  auth: boolean;
  admin?: boolean;
};

type ApiCatalogResponse = {
  message: string;
  base: string;
  endpoints: EndpointItem[];
};

export default function EndpointsPage() {
  const [catalog, setCatalog] = useState<ApiCatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const response = await apiGet<ApiCatalogResponse>('/');
        const data = (response.data || response) as ApiCatalogResponse;
        setCatalog(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'No se pudo cargar el catalogo de endpoints';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadCatalog();
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Catalogo de Endpoints</h1>
      <p className="text-sm text-gray-600 mb-8">
        Esta pantalla consume GET /api y muestra los endpoints definidos en backend.
      </p>

      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {catalog && (
        <div className="space-y-3">
          {catalog.endpoints.map((endpoint) => (
            <div key={`${endpoint.method}-${endpoint.path}`} className="rounded border p-4">
              <div className="flex items-center gap-3">
                <span className="rounded bg-black px-2 py-1 text-xs text-white">{endpoint.method}</span>
                <span className="font-mono text-sm">{catalog.base}{endpoint.path}</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                auth: {endpoint.auth ? 'si' : 'no'}{endpoint.admin ? ' | admin: si' : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
