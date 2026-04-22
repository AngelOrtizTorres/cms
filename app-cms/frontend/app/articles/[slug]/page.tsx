'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { getArticleBySlug, getArticles, Article } from '@/lib/services/articles';

export default function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticle() {
      setLoading(true);
      setError(null);

      try {
        // Obtener el artículo
        const articleResponse = await getArticleBySlug(resolvedParams.slug);
        
        // Manejar ambos formatos
        let articleData: Article;
        
        if (articleResponse?.id) {
          articleData = articleResponse;
        } else if (Array.isArray(articleResponse)) {
          articleData = articleResponse[0];
        } else {
          throw new Error('Artículo no encontrado');
        }

        setArticle(articleData);

        // Obtener artículos relacionados de la misma sección
        if (articleData.section_id) {
          try {
            const related = await getArticles({
              per_page: 5,
              section_id: articleData.section_id,
            });

            // Manejar respuesta
            let relatedList: Article[] = [];
            if (Array.isArray(related)) {
              relatedList = related.filter((a: Article) => a.id !== articleData.id);
            } else if (related?.data && Array.isArray(related.data)) {
              relatedList = related.data.filter((a: Article) => a.id !== articleData.id);
            }

            setRelatedArticles(relatedList.slice(0, 4));
          } catch (err) {
            console.log('No se pudieron cargar artículos relacionados');
          }
        }
      } catch (err: unknown) {
        const error = err as { message?: string };
        console.error('Error:', error);
        setError(error?.message || 'Error al cargar el artículo');
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [resolvedParams.slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-center text-gray-600 dark:text-gray-400">Cargando artículo...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'Artículo no encontrado'}</p>
          <Link href="/examples/articles" className="text-blue-600 hover:underline">
            ← Volver al listado
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
        <Link href="/examples/articles" className="hover:text-blue-600">
          Artículos
        </Link>
        {article.section && (
          <>
            <span>/</span>
            <span>{article.section.name}</span>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900 dark:text-white">{article.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{article.title}</h1>
          {article.featured && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-sm rounded-full">
              Destacado
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          {article.section && (
            <Link
              href={`/section/${article.section.slug}`}
              className="text-blue-600 hover:underline"
            >
              {article.section.name}
            </Link>
          )}
          {article.user && <span>Por {article.user.name}</span>}
          <time>{new Date(article.created_at).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}</time>
          <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
            {article.status === 'published' ? 'Publicado' : 'Borrador'}
          </span>
        </div>

        {article.excerpt && (
          <p className="text-lg text-gray-700 dark:text-gray-300 mt-4 italic">
            {article.excerpt}
          </p>
        )}
      </header>

      {/* Meta Tags */}
      {(article.meta_title || article.meta_description) && (
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">SEO</h3>
          {article.meta_title && (
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-1">
              <strong>Título:</strong> {article.meta_title}
            </p>
          )}
          {article.meta_description && (
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Descripción:</strong> {article.meta_description}
            </p>
          )}
        </div>
      )}

      {/* Content */}
      <div className="prose prose-invert max-w-none mb-12 dark:prose-invert">
        <div
          className="text-gray-900 dark:text-gray-100 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="mb-12 pb-8 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Etiquetas</h3>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full text-sm text-gray-900 dark:text-white transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Artículos Relacionados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedArticles.map((relatedArticle) => (
              <Link
                key={relatedArticle.id}
                href={`/articles/${relatedArticle.slug}`}
                className="group"
              >
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2">
                    {relatedArticle.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {relatedArticle.excerpt}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    {new Date(relatedArticle.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Back Button */}
      <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
        <Link
          href="/examples/articles"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          ← Volver al listado
        </Link>
      </div>
    </article>
  );
}
