'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import websitesService, { Website } from '@/lib/services/websites';

export default function WebsiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [site, setSite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        if (!id) return;
        const w = await websitesService.getWebsiteById(id);
        if (!mounted) return;
        setSite(w);
      } catch (e) {
        console.error('Error cargando sitio:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <p>Cargando sitio...</p>;
  if (!site) return <p className="text-gray-600">Sitio no encontrado.</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{site.name}</h1>
          <p className="text-sm text-gray-600">Detalle del sitio</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push(`/dashboard/websites/${site.id}/edit`)} className="px-3 py-1 bg-gray-800 text-white rounded">Editar</button>
          <button onClick={() => router.back()} className="px-3 py-1 rounded border">Volver</button>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <div className="mb-3">
          <div className="text-sm text-gray-500">URL</div>
          <div className="text-lg"><a href={site.url} target="_blank" rel="noreferrer" className="text-blue-600">{site.url}</a></div>
        </div>
        <div className="mb-3">
          <div className="text-sm text-gray-500">Propietario</div>
          <div>{site.owner}</div>
        </div>
        <div className="mb-3 text-sm text-gray-500">Creado: {site.created_at}</div>
      </div>
    </div>
  );
}
