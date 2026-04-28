'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiGet } from '@/lib/api';
import { Section, createSection } from '@/lib/services/articles';

export default function SiteCategoriesPage() {
  const params = useParams();
  const rawSiteId = params?.siteId;
  const siteId = Array.isArray(rawSiteId) ? rawSiteId[0] : rawSiteId;
  const [items, setItems] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!siteId) return;
      setLoading(true);
      try {
        const resp: any = await apiGet(`/sections?website_id=${siteId}`);
        const list = (resp && (resp.data || resp)) || [];
        if (!mounted) return;
        setItems(Array.isArray(list) ? list : (list.data || []));
      } catch (e) {
        console.error('Error cargando categorías del sitio:', e);
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
        <h1 className="text-3xl font-bold">Categorías</h1>
        <div>
          <button
            onClick={() => setShowCreate((s) => !s)}
            className="px-3 py-2 bg-blue-600 text-white rounded"
          >
            {showCreate ? 'Cancelar' : 'Crear categoría'}
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <div className="grid grid-cols-1 gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" className="p-2 border rounded" />
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug" className="p-2 border rounded" />
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción (opcional)" className="p-2 border rounded" />
            <label className="text-sm text-gray-600">Depende de</label>
            <select value={parentId} onChange={(e) => setParentId(e.target.value)} className="p-2 border rounded">
              <option value="">Ninguno</option>
              {items.map((s) => (
                <option key={s.id} value={String(s.id)}>{s.name}</option>
              ))}
            </select>
            <div className="pt-2">
              <button
                disabled={creating || !name}
                onClick={async () => {
                  if (!siteId) return;
                  setCreating(true);
                  try {
                    await createSection({ name, slug, description, website_id: Number(siteId), parent_id: parentId ? Number(parentId) : null });
                    setName(''); setSlug(''); setDescription(''); setShowCreate(false);
                    const resp: any = await apiGet(`/sections?website_id=${siteId}`);
                    const list = (resp && (resp.data || resp)) || [];
                    setItems(Array.isArray(list) ? list : (list.data || []));
                  } catch (e) {
                    console.error('Error creando categoría:', e);
                    alert('Error creando categoría');
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

      <p className="text-sm text-gray-600 mb-6">Categorías del sitio</p>

      {loading ? (
        <p>Cargando categorías...</p>
      ) : (
        <div className="space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-gray-500">No hay categorías.</p>
          ) : (
            items.map((s) => (
              <div key={s.id} className="p-3 border rounded hover:bg-gray-50">
                <Link href={`/sections/${s.slug}`} className="font-medium text-gray-800">{s.name}</Link>
                <p className="text-sm text-gray-500">{s.description}</p>
              </div>
            ))
          )}
        </div>
      )}
    </main>
  );
}
