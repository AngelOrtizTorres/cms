 'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import { apiGet } from '@/lib/api';
import { Article, Section, Tag } from '@/lib/services/articles';
import websitesService from '@/lib/services/websites';

export default function SiteSidebar({ logout, router: routerProp }: { logout: any; router?: any }) {
  const { selectedSite, setSelectedSite, clearSelectedSite } = useSidebar();
  const pathname = usePathname();
  const router = routerProp || useRouter();
  const { user } = useAuth();

  const [sections, setSections] = useState<Section[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadForSite(siteToLoad: any) {
      if (!siteToLoad) return;
      setLoadingData(true);
      try {
        const sResp: any = await apiGet(`/sections?website_id=${siteToLoad.id}`);
        const tResp: any = await apiGet(`/tags?website_id=${siteToLoad.id}`);
        const aResp: any = await apiGet(`/articles?website_id=${siteToLoad.id}&per_page=6`);

        if (!mounted) return;
        setSections((sResp && (sResp.data || sResp)) || []);
        setTags((tResp && (tResp.data || tResp)) || []);
        const articlesList = (aResp && (aResp.data?.data || aResp.data || aResp)) || [];
        setArticles(Array.isArray(articlesList) ? articlesList : (articlesList.data || []));
      } catch (e) {
        console.error('Error cargando datos del sitio para sidebar:', e);
        setSections([]);
        setTags([]);
        setArticles([]);
      } finally {
        if (mounted) setLoadingData(false);
      }
    }

    (async () => {
      if (selectedSite) {
        await loadForSite(selectedSite);
        return;
      }

      try {
        const m = pathname ? pathname.match(/\/(?:dashboard\/websites|site)\/([^/]+)/) : null;
        const idFromPath = m ? m[1] : null;
        if (idFromPath) {
          const w = await websitesService.getWebsiteById(idFromPath);
          if (mounted && w) {
            setSelectedSite(w as any);
            await loadForSite(w);
            return;
          }
        }
      } catch (e) {
        console.error('Error inferring site id for sidebar:', e);
      }

      if (mounted) {
        setSections([]);
        setTags([]);
        setArticles([]);
      }
    })();

    return () => { mounted = false; };
  }, [selectedSite, pathname, setSelectedSite]);

  if (selectedSite) {
    if (hidden) {
      return (
        <div className="flex flex-col items-start">
          <button
            aria-label="Abrir menú"
            className="m-2 py-2 px-4 bg-gray-900 text-white rounded-md"
            onClick={() => setHidden(false)}
          >
            ☰
          </button>
        </div>
      );
    }

    return (
      <aside className="w-72 bg-white text-gray-800 p-6 flex flex-col gap-6 border-r">
        <div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900">{selectedSite.name}</h2>
          <div className="flex gap-3 items-center">
            <a href={selectedSite.url || '#'} target="_blank" rel="noreferrer" className="px-3 py-2 bg-gray-800 text-white rounded text-sm">ver sitio</a>
            <Link href={`/dashboard/websites/${selectedSite.id}/edit`} className="text-sm text-gray-600">Editar</Link>
          </div>
        </div>

        <nav className="flex-1">
          <ul className="space-y-3">
            <li>
              <Link href={`/dashboard/websites/${selectedSite.id}/articles`} className="flex items-center gap-3 text-gray-700 hover:text-gray-900">
                <span className="w-6 h-6 flex items-center justify-center text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    <path d="M17 3v8"></path>
                    <path d="M7 11h8"></path>
                  </svg>
                </span>
                Entradas
              </Link>
            </li>
            <li>
              <Link href={`/dashboard/websites/${selectedSite.id}/media`} className="flex items-center gap-3 text-gray-700 hover:text-gray-900">
                <span className="w-6 h-6 flex items-center justify-center text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <path d="M21 15l-5-5L5 21"></path>
                  </svg>
                </span>
                Medios
              </Link>
            </li>
            <li>
              <Link href={`/dashboard/websites/${selectedSite.id}/pages`} className="flex items-center gap-3 text-gray-700 hover:text-gray-900">
                <span className="w-6 h-6 flex items-center justify-center text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <path d="M14 2v6h6"></path>
                  </svg>
                </span>
                Páginas
              </Link>
            </li>
            <li>
              <Link href={`/site/${selectedSite.id}/category`} className="flex items-center gap-3 text-gray-700 hover:text-gray-900">
                <span className="w-6 h-6 flex items-center justify-center text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M4 4v16"></path>
                    <path d="M9 4v16"></path>
                  </svg>
                </span>
                Categorias
              </Link>
            </li>
            <li>
              <Link href={`/site/${selectedSite.id}/tag`} className="flex items-center gap-3 text-gray-700 hover:text-gray-900">
                <span className="w-6 h-6 flex items-center justify-center text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 11.99 12 2l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                    <circle cx="7.5" cy="7.5" r="1.5"></circle>
                  </svg>
                </span>
                Etiquetas
              </Link>
            </li>
            <li>
              <Link href={`/dashboard/websites/${selectedSite.id}/comments`} className="flex items-center gap-3 text-gray-700 hover:text-gray-900">
                <span className="w-6 h-6 flex items-center justify-center text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </span>
                Comentarios
              </Link>
            </li>
            <li>
              <Link href={`/dashboard/websites/${selectedSite.id}/settings`} className="flex items-center gap-3 text-gray-700 hover:text-gray-900">
                <span className="w-6 h-6 flex items-center justify-center text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 0 1 2.3 17.88l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09c.7 0 1.32-.4 1.51-1a1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 0 1 6.12 2.3l.06.06c.5.5 1.22.66 1.82.33.6-.33 1-1.07 1-1.75V3a2 2 0 0 1 4 0v.09c0 .68.4 1.42 1 1.75.6.33 1.32.17 1.82-.33l.06-.06A2 2 0 0 1 21.7 6.12l-.06.06c-.33.6-.17 1.32.33 1.82.4.4.66 1.12.33 1.82H21a2 2 0 0 1 0 4h-.09c-.7 0-1.32.4-1.51 1z"></path>
                  </svg>
                </span>
                Configuración
              </Link>
            </li>
            <li>
              <button
                onClick={() => setHidden(true)}
                className="flex items-center gap-3 text-gray-600 hover:text-gray-900"
              >
                <span className="w-6 h-6 flex items-center justify-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </span>
                Cerrar Menú
              </button>
            </li>
          </ul>
        </nav>

        <div className="mt-auto pt-4 border-t">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-lg font-semibold text-gray-700">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{user?.name || 'Nombre y apellidos'}</div>
              <div className="text-xs text-gray-500">{user?.email || 'correo@ejemplo.com'}</div>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <Link href="/dashboard/profile" className="text-sm text-gray-600">Ajustes</Link>
            <button
              onClick={async () => { await logout(); router.push('/login'); }}
              className="ml-auto text-sm text-red-600"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-gray-100 p-5 flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Panel Sitio</h2>
      <nav className="flex flex-col gap-2">
        <Link href="#">Panel</Link>
        <Link href="#">Secciones</Link>
        <Link href="#">Categorías</Link>
        <Link href="#">Etiquetas</Link>
        <Link href="#">Banners</Link>
        <Link href="#">Noticias</Link>
        <Link href="#">Configuración</Link>
      </nav>
    </aside>
  );
}
