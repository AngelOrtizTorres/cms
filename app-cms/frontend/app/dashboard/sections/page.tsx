'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Section, getSections } from '@/lib/services/articles';

export default function DashboardSectionsPage() {
  const [items, setItems] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const data = await getSections();
      if (!mounted) return;
      setItems(data || []);
      setLoading(false);
    }

    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Secciones</h1>
          <p className="text-sm text-gray-600">Gestiona las secciones del sitio</p>
        </div>

        <div>
          <Link href="/dashboard/sections/create" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Añadir sección
          </Link>
        </div>
      </div>

      {loading ? (
        <p>Cargando secciones...</p>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left"><input type="checkbox" /></th>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Slug</th>
                <th className="px-4 py-2 text-left">Artículos</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-600">No hay secciones.</td>
                </tr>
              )}

              {items.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3"><input type="checkbox" /></td>
                  <td className="px-4 py-3 font-medium"><Link href={`/dashboard/sections/${s.id}`} className="text-blue-600 hover:underline">{s.name}</Link></td>
                  <td className="px-4 py-3 text-sm text-gray-700">{s.slug}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{(s as any).article_count ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/dashboard/sections/${s.id}/edit`} className="text-sm text-blue-600">Editar</Link>
                      <button onClick={() => console.log('Eliminar sección', s.id)} className="text-sm text-red-600">Eliminar</button>
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
