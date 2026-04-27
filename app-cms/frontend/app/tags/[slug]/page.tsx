'use client';

import { use } from 'react';
import { useEffect, useState } from 'react';
import { getArticlesByTag, Tag } from '@/lib/services/articles';

export default function TagDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolved = use(params);
  const [tag, setTag] = useState<Tag | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setTag(await getArticlesByTag(resolved.slug));
      setLoading(false);
    }

    load();
  }, [resolved.slug]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Detalle de etiqueta</h1>
      <p className="text-sm text-gray-600 mb-8">Esta vista consume GET /tags/{'{slug}'}</p>

      {loading ? <p>Cargando...</p> : null}
      {tag ? (
        <div className="rounded-lg border p-6">
          <p className="text-sm text-gray-500 mb-2">ID: {tag.id}</p>
          <h2 className="text-xl font-semibold">{tag.name}</h2>
          <p className="text-sm mt-2 text-gray-600">{tag.description || 'Sin descripcion'}</p>
        </div>
      ) : null}
    </main>
  );
}
