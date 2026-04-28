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
      <aside className="w-64 bg-slate-900 text-slate-100 p-4 flex flex-col gap-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{selectedSite.name}</h2>

        <a href={selectedSite.url || '#'} target="_blank" rel="noreferrer" className="text-blue-300 hover:underline mb-2">
          Visitar sitio
        </a>

        <Link href={`/dashboard/websites/${selectedSite.id}/edit`} className="text-sm text-gray-200">Editar sitio</Link>
        <Link href="/dashboard/websites" className="text-sm text-gray-200">Todos los sitios</Link>

        <div className="mt-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Personalizar sitio</h3>
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
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Acciones rápidas</h3>
          <div className="flex flex-col gap-2">
            <Link href={`/dashboard/websites/${selectedSite.id}/create-article`} className="px-2 py-1 bg-blue-600 text-sm rounded text-white hover:bg-blue-700">Crear artículo</Link>
            <Link href={`/dashboard/websites/${selectedSite.id}/create-section`} className="px-2 py-1 bg-green-600 text-sm rounded text-white hover:bg-green-700">Crear sección</Link>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Secciones</h3>
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
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Etiquetas</h3>
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
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Artículos recientes</h3>
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

        <div className="mt-auto text-sm text-slate-400">Contenido exclusivo del sitio</div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 p-4 flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center text-lg font-bold">CMS</div>
        <div>
          <div className="text-sm">CMS Admin</div>
          <div className="text-xs text-slate-400">Gestor de contenidos</div>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-slate-300"><path d="M3 13h8V3H3v10zM13 21h8v-6h-8v6zM13 3v6h8V3h-8zM3 21h8v-6H3v6z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="text-sm">Panel</span>
        </Link>

        <Link href="/dashboard/websites" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-slate-300"><path d="M12 2l4 4-4 4-4-4 4-4zM2 12l4 4-4 4 4 4 4-4-4-4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="text-sm">Sitios web</span>
        </Link>

        <Link href="/dashboard/users" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/5">
          <svg width="18" height="18" fill="none" className="text-slate-300" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2"/></svg>
          <span className="text-sm">Usuarios</span>
        </Link>
      </nav>

      <div className="mt-auto">
        <button onClick={async () => { await logout(); router.push('/login'); }} className="w-full text-left px-3 py-2 text-sm text-red-400 rounded hover:bg-red-50/5">Cerrar sesión</button>
      </div>
    </aside>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, loading, logout, user } = useAuth();

  const pathname = usePathname();

  const pageTitle = (() => {
    if (!pathname) return 'Panel';
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return 'Panel';
    // Mostrar últimos dos segmentos friendly
    return segments.slice(-2).map(s => s.replace(/[-_]/g, ' ')).join(' / ');
  })();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-100 text-gray-900">

        {/* SIDEBAR (similar WP left menu) */}
        <SidebarInner logout={logout} router={router} />

        {/* MAIN column */}
        <div className="flex-1 flex flex-col min-h-screen">

          {/* Top admin bar */}
          <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <button className="p-2 rounded hover:bg-gray-100 text-gray-600" aria-label="toggle menu">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-600">
                  <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div>
                <div className="text-sm text-gray-500">Administración</div>
                <div className="sr-only">{pageTitle}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="text-sm text-gray-600 px-3 py-1 rounded hover:bg-gray-50">Vista sitio</button>
              <div className="flex items-center gap-3">
                <div className="text-right mr-2 hidden sm:block">
                  <div className="text-sm">{user?.name ?? 'Usuario'}</div>
                  <div className="text-xs text-gray-500">{user?.email ?? ''}</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm text-gray-700">{(user?.name || 'U').charAt(0)}</div>
                <button onClick={async () => { await logout(); router.push('/login'); }} className="text-sm text-red-600 px-2 py-1 rounded hover:bg-red-50">Salir</button>
              </div>
            </div>
          </header>

          {/* Content area */}
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white shadow rounded-lg p-6">
                {children}
              </div>
            </div>
          </main>

        </div>

      </div>
    </SidebarProvider>
  );
}
