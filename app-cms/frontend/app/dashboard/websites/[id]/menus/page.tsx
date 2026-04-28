'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import websitesService, { Website } from '@/lib/services/websites';
import { useSidebar } from '@/context/SidebarContext';

export default function MenusPage() {
  const params = useParams();
  const id = params?.id;
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
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id, setSelectedSite, clearSelectedSite]);

  if (loading) return <p>Cargando menús...</p>;
  if (!site) return <p>Site no encontrado</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">Menús: {site.name}</h1>
      <p className="mt-4">Crea y organiza menús para el sitio.</p>
    </div>
  );
}
