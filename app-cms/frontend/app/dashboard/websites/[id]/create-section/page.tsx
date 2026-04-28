'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import websitesService, { Website } from '@/lib/services/websites';
import { useSidebar } from '@/context/SidebarContext';

export default function CreateSectionPage() {
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
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id, setSelectedSite, clearSelectedSite]);

  if (loading) return <p>Cargando creador de sección...</p>;
  if (!site) return <p>Site no encontrado</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">Crear sección en {site.name}</h1>
      <p className="mt-4">Formulario para crear sección (placeholder).</p>
    </div>
  );
}
