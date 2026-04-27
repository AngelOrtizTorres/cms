'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Article, searchArticles } from '@/lib/services/articles';

export default function SearchClient() {
  const params = useSearchParams();
  const term = useMemo(() => params.get('q') || '', [params]);

  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!term) {
        setItems([]);
        return;
      }

      setLoading(true);

      try {
        const result = await searchArticles(term, 20);
        setItems(Array.isArray(result) ? result : []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [term]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Búsqueda</h1>

      {!term && <p>Agrega ?q=algo en la URL</p>}
      {loading && <p>Cargando...</p>}

      <div className="space-y-3">
        {items.map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className="block border p-4 rounded hover:bg-gray-50"
          >
            <p className="font-semibold">{article.title}</p>
            <p className="text-sm text-gray-600">{article.excerpt}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}