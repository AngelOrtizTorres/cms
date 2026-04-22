'use client';

import { useEffect, useState } from 'react';
import { getArticles, Article, PaginatedResponse } from '@/lib/services/articles';
import { useAuth } from '@/context/AuthContext';

export default function ArticlesExample() {
  const { user, token, isAuthenticated } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);
      setError(null);

      try {
        console.log('🟢 Iniciando fetch de artículos...');
        const response = await getArticles({
          page,
          per_page: 10,
          sort: '-created_at',
        });

        console.log('🟢 Response completa:', response);
        
        // IMPORTANTE: Manejar ambos formatos
        let articlesData: Article[] = [];
        let totalCount = 0;

        // Si es array directo
        if (Array.isArray(response)) {
          console.log('📌 Response es un ARRAY directo - usando como artículos');
          articlesData = response;
          totalCount = response.length;
        }
        // Si tiene estructura {data, meta}
        else if (response?.data && Array.isArray(response.data)) {
          console.log('📌 Response tiene propiedad .data - estructura correcta');
          articlesData = response.data;
          totalCount = response.meta?.total || response.data.length;
        }

        console.log('✅ Articles a renderizar:', articlesData.length);
        setArticles(articlesData);
        setTotal(totalCount);
      } catch (err: any) {
        console.error('🔴 Error:', err);
        setError(err?.message || 'Error fetching articles');
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ejemplo: Artículos</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Integración con la API de Laravel - Cargando artículos del backend
        </p>
      </div>

      {/* Info del Usuario */}
      {isAuthenticated && user && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-blue-900 dark:text-blue-100">
            <strong>Usuario autenticado:</strong> {user.name} ({user.role})
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-900 dark:text-red-100">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Cargando artículos...</p>
        </div>
      )}

      {/* Artículos */}
      {!loading && articles.length > 0 && (
        <div className="space-y-4">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {article.title}
                    </h2>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        article.status === 'published'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}
                    >
                      {article.status}
                    </span>
                    {article.featured && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                        Destacado
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-3">{article.excerpt}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>ID: {article.id}</span>
                    <span>Slug: {article.slug}</span>
                    <span>{new Date(article.created_at).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>

                {isAuthenticated && (
                  <div className="ml-4 flex gap-2">
                    <button className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
                      Editar
                    </button>
                    <button className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors">
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sin artículos */}
      {!loading && articles.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">No hay artículos disponibles</p>
        </div>
      )}

      {/* Paginación */}
      {!loading && total > 10 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 rounded transition-colors"
          >
            Anterior
          </button>
          <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
            Página {page} de {Math.ceil(total / 10)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(total / 10)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 rounded transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Código de Ejemplo */}
      <div className="bg-gray-900 text-gray-100 rounded-lg p-6 overflow-x-auto">
        <h3 className="font-bold mb-4 text-white">Código de Ejemplo</h3>
        <pre className="text-sm">
{`import { getArticles } from '@/lib/services/articles';
import { useAuth } from '@/context/AuthContext';

export default function ArticlesPage() {
  const { token } = useAuth();
  
  useEffect(() => {
    async function fetch() {
      const data = await getArticles({ 
        page: 1, 
        per_page: 10 
      });
      console.log(data);
    }
    fetch();
  }, []);
}`}
        </pre>
      </div>
    </div>
  );
}
