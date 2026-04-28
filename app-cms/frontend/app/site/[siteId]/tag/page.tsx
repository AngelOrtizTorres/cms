'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiGet } from '@/lib/api';
import { Tag, createTag } from '@/lib/services/articles';

export default function SiteTagsPage() {
  const params = useParams();
  const rawSiteId = params?.siteId;
  const siteId = Array.isArray(rawSiteId) ? rawSiteId[0] : rawSiteId;
  const [items, setItems] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!siteId) return;
      setLoading(true);
      try {
        const resp: any = await apiGet(`/tags?website_id=${siteId}`);
        const list = (resp && (resp.data || resp)) || [];
        if (!mounted) return;
        setItems(Array.isArray(list) ? list : (list.data || []));
      } catch (e) {
        console.error('Error cargando etiquetas del sitio:', e);
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [siteId]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Etiquetas</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreate((s) => !s)}
            className="px-3 py-2 bg-blue-600 text-white rounded"
          >
            {showCreate ? 'Cancelar' : 'Crear etiqueta'}
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <div className="grid grid-cols-1 gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" className="p-2 border rounded" />
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug" className="p-2 border rounded" />
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción (opcional)" className="p-2 border rounded" />
            <div className="pt-2">
              <button
                disabled={creating || !name}
                onClick={async () => {
                  if (!siteId) return;
                  setCreating(true);
                  try {
                    await createTag({ name, slug, description, website_id: Number(siteId) });
                    setName(''); setSlug(''); setDescription(''); setShowCreate(false);
                    // reload
                    const resp: any = await apiGet(`/tags?website_id=${siteId}`);
                    const list = (resp && (resp.data || resp)) || [];
                    setItems(Array.isArray(list) ? list : (list.data || []));
                  } catch (e) {
                    console.error('Error creando etiqueta:', e);
                    alert('Error creando etiqueta');
                  } finally {
                    setCreating(false);
                  }
                }}
                className="px-3 py-2 bg-green-600 text-white rounded"
              >
                {creating ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-sm text-gray-600 mb-6">Etiquetas del sitio</p>

      {loading ? (
        <p>Cargando etiquetas...</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.length === 0 ? (
            <p className="text-sm text-gray-500">No hay etiquetas.</p>
          ) : (
            items.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="rounded-full border px-4 py-2 hover:bg-gray-50"
              >
                #{tag.name}
              </Link>
            ))
          )}
        </div>
      )}
    </main>
  );
}
