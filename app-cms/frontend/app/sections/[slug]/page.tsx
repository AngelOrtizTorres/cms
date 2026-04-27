'use client';

import { use } from 'react';
import { useEffect, useState } from 'react';
import { getArticlesBySection, Section } from '@/lib/services/articles';

export default function SectionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolved = use(params);
  const [section, setSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getArticlesBySection(resolved.slug);
        setSection(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'No se encontro la seccion';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [resolved.slug]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Detalle de seccion</h1>
      <p className="text-sm text-gray-600 mb-8">Esta vista consume GET /sections/{'{slug}'}</p>

      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {section && (
        <div className="rounded-lg border p-6">
          <p className="text-sm text-gray-500 mb-2">ID: {section.id}</p>
          <h2 className="text-xl font-semibold">{section.name}</h2>
          <p className="text-sm mt-2 text-gray-600">{section.description || 'Sin descripcion'}</p>
        </div>
      )}
    </main>
  );
}
