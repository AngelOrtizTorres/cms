'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import websitesService, { Website } from '@/lib/services/websites';

export default function DashboardWebsitesPage() {
  const { token, refreshUser, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [sites, setSites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewAll, setViewAll] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (authLoading) return;

    async function load() {
      try {
        setLoading(true);
        const res = await websitesService.getWebsites(token || undefined);
        if (!mounted) return;
        setSites(res || []);
        setError(null);
      } catch (err: any) {
        console.error('Error cargando websites:', err);
        setError('Error cargando sitios');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [token, authLoading]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Sitios web</h1>
          <p className="text-sm text-gray-600">Gestiona tus sitios web (mis sitios / todas)</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">Ver:</div>
          <button
            onClick={() => setViewAll(false)}
            className={`px-3 py-1 rounded ${!viewAll ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}
          >
            Mis sitios
          </button>
          <button
            onClick={() => setViewAll(true)}
            className={`px-3 py-1 rounded ${viewAll ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}
          >
            Todas
          </button>

          <Link href="/dashboard/websites/create" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Crear sitio
          </Link>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm text-gray-400">Debug: authLoading={String(authLoading)}, isAuthenticated={String(isAuthenticated)}, sites={sites.length}</div>
        <div className="mt-2">
          <button
            onClick={async () => {
              try {
                await refreshUser();
                const res = await websitesService.getWebsites(token || undefined);
                setSites(res || []);
                setError(null);
              } catch (e) {
                console.error('Reintento falló:', e);
                setError('Reintento falló');
              }
            }}
            className="inline-block bg-gray-700 text-white px-3 py-1 rounded mr-2"
          >
            Reintentar carga
          </button>
        </div>
      </div>

      {loading || authLoading ? (
        <p>Cargando sitios...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">URL</th>
                <th className="px-4 py-2 text-left">Propietario</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sites.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-600">No hay sitios.</td>
                </tr>
              )}

              {sites
                .filter((s) => (viewAll ? true : (s.owner ? s.owner === 'Admin' || s.owner === 'admin' : true)))
                .map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/websites/${s.id}`} className="text-blue-600 hover:underline">
                        {s.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{s.url}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{s.owner}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link href={`/dashboard/websites/${s.id}/edit`} className="text-sm text-blue-600">Editar</Link>
                        <button
                          onClick={async () => {
                            // eliminar local
                            try {
                              await websitesService.deleteWebsiteLocal(s.id);
                              setSites((prev) => prev.filter((x) => x.id !== s.id));
                            } catch (e) {
                              console.error('Eliminar fallo', e);
                            }
                          }}
                          className="text-sm text-red-600"
                        >
                          Eliminar
                        </button>
                        <a
                          href={`/site/${s.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-green-600"
                        >
                          Abrir panel
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
