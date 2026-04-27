'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Article, getArticles } from '@/lib/services/articles';

export default function ArticlesPage() {
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await getArticles({ per_page: 20, sort: '-created_at' });
        setItems(Array.isArray(result) ? result : (result?.data || []));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'No fue posible cargar articulos';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Articulos</h1>
      <p className="text-sm text-gray-600 mb-8">Esta vista consume GET /articles</p>

      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="space-y-4">
        {items.map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className="block rounded-lg border p-4 hover:bg-gray-50"
          >
            <h2 className="font-semibold">{article.title}</h2>
            <p className="text-sm text-gray-600 mt-1">{article.excerpt}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
