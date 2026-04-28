'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import websitesService, { Website } from '@/lib/services/websites';
import { useSidebar } from '@/context/SidebarContext';

export default function WebsiteSiteDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const [site, setSite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);
  const { setSelectedSite, clearSelectedSite } = useSidebar();

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        if (!id) return;
        const w = await websitesService.getWebsiteById(id);
        if (!mounted) return;
        setSite(w);
        setSelectedSite(w as any);
      } catch (e) {
        console.error('Error cargando sitio para dashboard:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id, setSelectedSite, clearSelectedSite]);

  if (loading) return <p>Cargando dashboard del sitio...</p>;
  if (!site) return <p className="text-gray-600">Sitio no encontrado.</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard: {site.name}</h1>
          <p className="text-sm text-gray-600">Panel específico del sitio</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push(`/dashboard/websites/${site.id}/edit`)} className="px-3 py-1 bg-gray-800 text-white rounded">Editar</button>
          <button onClick={() => router.push('/dashboard/websites')} className="px-3 py-1 rounded border">Volver a sitios</button>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <p>Este es el contenido del dashboard específico del sitio. Añade widgets, estadísticas o navegación aquí.</p>
      </div>
    </div>
  );
}
