'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import websitesService, { Website } from '@/lib/services/websites';

export default function SiteDashboardPage() {
  const params = useParams();
  const siteId = params?.siteId;
  const [site, setSite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!siteId) return;
      setLoading(true);
      const w = await websitesService.getWebsiteById(siteId);
      if (!mounted) return;
      setSite(w);
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [siteId]);

  if (loading) return <p>Cargando panel del sitio...</p>;
  if (!site) return <p>Sitio no encontrado.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{site.name} — Panel</h1>
      <p className="text-gray-600 mb-4">URL: <a href={site.url} className="text-blue-600">{site.url}</a></p>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Estadísticas</h3>
          <p className="text-sm text-gray-500">(Placeholder)</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Acciones rápidas</h3>
          <p className="text-sm text-gray-500">(Placeholder)</p>
        </div>
      </div>
    </div>
  );
}
