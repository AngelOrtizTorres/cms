'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Tag, getTags } from '@/lib/services/articles';

export default function DashboardTagsPage() {
  const [items, setItems] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const data = await getTags();
      if (!mounted) return;
      setItems(data || []);
      setLoading(false);
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Etiquetas</h1>
          <p className="text-sm text-gray-600">Administrar etiquetas del CMS</p>
        </div>

        <div>
          <Link href="/dashboard/tags/create" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Añadir etiqueta
          </Link>
        </div>
      </div>

      {loading ? (
        <p>Cargando etiquetas...</p>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left"><input type="checkbox" /></th>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Slug</th>
                <th className="px-4 py-2 text-left">Descripción</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-600">No hay etiquetas.</td>
                </tr>
              )}

              {items.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-3"><input type="checkbox" /></td>
                  <td className="px-4 py-3 font-medium"><Link href={`/tags/${t.slug}`} className="text-blue-600 hover:underline">{t.name}</Link></td>
                  <td className="px-4 py-3 text-sm text-gray-700">{t.slug}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{t.description || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/dashboard/tags/${t.id}/edit`} className="text-sm text-blue-600">Editar</Link>
                      <button onClick={() => console.log('Eliminar etiqueta', t.id)} className="text-sm text-red-600">Eliminar</button>
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
