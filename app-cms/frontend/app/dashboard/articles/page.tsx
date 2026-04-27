"use client";

import { useEffect, useState } from 'react';
import { getArticles } from '@/lib/services/articles';

export default function DashboardArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchArticles() {
      try {
        const res = await getArticles({ per_page: 20 });
        if (!mounted) return;
        setArticles(res.data || []);
      } catch (err: any) {
        setError(err?.message || 'Error cargando artículos');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchArticles();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <p>Cargando artículos...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Artículos</h1>

      {articles.length === 0 ? (
        <p>No hay artículos.</p>
      ) : (
        <div className="grid gap-4">
          {articles.map((a) => (
            <article key={a.id} className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold">{a.title}</h2>
              <p className="text-sm text-gray-600">{a.excerpt}</p>
              <p className="text-xs text-gray-400 mt-2">Publicado: {a.published_at}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
