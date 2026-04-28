'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { SidebarProvider, useSidebar } from '@/context/SidebarContext';
import { apiGet } from '@/lib/api';
import { Article, Section, Tag } from '@/lib/services/articles';
import websitesService from '@/lib/services/websites';

function SidebarInner({ logout, router }: { logout: any; router: any }) {
  const { selectedSite, setSelectedSite } = useSidebar();
  const pathname = usePathname();

  const [sections, setSections] = useState<Section[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingData, setLoadingData] = useState(false);

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
        const m = pathname ? pathname.match(/\/dashboard\/websites\/([^/]+)/) : null;
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
    return (
      <aside className="w-64 bg-gray-900 text-white p-5 flex flex-col gap-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{selectedSite.name}</h2>

        <a href={selectedSite.url || '#'} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline mb-2">
          Visitar sitio
        </a>

        <Link href={`/dashboard/websites/${selectedSite.id}/edit`} className="text-sm text-gray-200">Editar sitio</Link>
        <Link href="/dashboard/websites" className="text-sm text-gray-200">Todos los sitios</Link>

        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Personalizar sitio</h3>
          <div className="flex flex-col gap-2">
            <Link href={`/dashboard/websites/${selectedSite.id}/customize`} className="px-2 py-1 bg-gray-800 text-sm rounded text-gray-200 hover:bg-gray-700">Personalizar</Link>
            <Link href={`/dashboard/websites/${selectedSite.id}/themes`} className="px-2 py-1 bg-gray-800 text-sm rounded text-gray-200 hover:bg-gray-700">Temas</Link>
            <Link href={`/dashboard/websites/${selectedSite.id}/menus`} className="px-2 py-1 bg-gray-800 text-sm rounded text-gray-200 hover:bg-gray-700">Menús</Link>
            <Link href={`/dashboard/websites/${selectedSite.id}/widgets`} className="px-2 py-1 bg-gray-800 text-sm rounded text-gray-200 hover:bg-gray-700">Widgets</Link>
            <Link href={`/dashboard/websites/${selectedSite.id}/media`} className="px-2 py-1 bg-gray-800 text-sm rounded text-gray-200 hover:bg-gray-700">Medios</Link>
            <Link href={`/dashboard/websites/${selectedSite.id}/settings`} className="px-2 py-1 bg-gray-800 text-sm rounded text-gray-200 hover:bg-gray-700">Ajustes</Link>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Acciones rápidas</h3>
          <div className="flex flex-col gap-2">
            <Link href={`/dashboard/websites/${selectedSite.id}/create-article`} className="px-2 py-1 bg-blue-600 text-sm rounded text-white hover:bg-blue-700">Crear artículo</Link>
            <Link href={`/dashboard/websites/${selectedSite.id}/create-section`} className="px-2 py-1 bg-green-600 text-sm rounded text-white hover:bg-green-700">Crear sección</Link>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Secciones</h3>
          {loadingData ? <p className="text-xs text-gray-400">Cargando...</p> : (
            sections.length === 0 ? <p className="text-xs text-gray-500">No hay secciones</p> : (
              <ul className="text-sm space-y-1">
                {sections.map(s => (
                  <li key={s.id}><Link href={`/dashboard/sections/${s.id}`} className="text-gray-200 hover:underline">{s.name}</Link></li>
                ))}
              </ul>
            )
          )}
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Etiquetas</h3>
          {loadingData ? <p className="text-xs text-gray-400">Cargando...</p> : (
            tags.length === 0 ? <p className="text-xs text-gray-500">No hay etiquetas</p> : (
              <ul className="text-sm space-y-1">
                {tags.map(t => (
                  <li key={t.id}><Link href={`/dashboard/tags/${t.id}`} className="text-gray-200 hover:underline">{t.name}</Link></li>
                ))}
              </ul>
            )
          )}
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Artículos recientes</h3>
          {loadingData ? <p className="text-xs text-gray-400">Cargando...</p> : (
            articles.length === 0 ? <p className="text-xs text-gray-500">No hay artículos</p> : (
              <ul className="text-sm space-y-1">
                {articles.map(a => (
                  <li key={a.id}><Link href={`/articles/${a.slug}`} className="text-gray-200 hover:underline">{a.title}</Link></li>
                ))}
              </ul>
            )
          )}
        </div>

        <div className="mt-auto text-sm text-gray-400">Contenido exclusivo del sitio</div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-gray-900 text-white p-5 flex flex-col gap-4">
      <h2 className="text-xl font-bold mb-6">CMS Admin</h2>

      <Link href="/dashboard">Panel</Link>
      <Link href="/dashboard/websites">Sitios web</Link>
      <Link href="/dashboard/users">Usuarios</Link>

      <button
        className="mt-auto text-red-400"
        onClick={async () => {
          await logout();
          router.push('/login');
        }}
      >
        Logout
      </button>
    </aside>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-black text-white">

        {/* SIDEBAR */}
        <SidebarInner logout={logout} router={router} />

        {/* MAIN */}
        <main className="flex-1 p-6">
          {children}
        </main>

      </div>
    </SidebarProvider>
  );
}
