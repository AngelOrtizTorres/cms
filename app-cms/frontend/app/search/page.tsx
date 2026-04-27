'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Article, searchArticles } from '@/lib/services/articles';

function SearchPageContent() {
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
      const result = await searchArticles(term, 20);
      setItems(result);
      setLoading(false);
    }

    load();
  }, [term]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Busqueda</h1>
      <p className="text-sm text-gray-600 mb-8">Esta vista consume GET /search?q=...</p>

      {!term && <p>Agrega el parametro q en la URL, por ejemplo /search?q=laravel</p>}
      {loading && <p>Cargando...</p>}

      <div className="space-y-3">
        {items.map((article) => (
          <Link key={article.id} href={`/articles/${article.slug}`} className="block rounded border p-4 hover:bg-gray-50">
            <p className="font-semibold">{article.title}</p>
            <p className="text-sm text-gray-600">{article.excerpt}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-5xl px-4 py-10"><p>Cargando...</p></main>}>
      <SearchPageContent />
    </Suspense>
  );
}
