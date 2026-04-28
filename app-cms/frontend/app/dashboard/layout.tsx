'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, loading, logout, user } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  return (
    <div className="flex min-h-screen bg-black text-white">

      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-900 text-white p-5 flex flex-col gap-4">
        <h2 className="text-xl font-bold mb-6">CMS Admin</h2>

        <nav className="flex flex-col gap-2">
          <Link href="/dashboard">Panel</Link>
          <Link href="/dashboard/sections">Secciones</Link>
          <Link href="/dashboard/tags">Etiquetas</Link>
          <Link href="/dashboard/banners">Banners</Link>
          <Link href="/dashboard/articles">Noticias</Link>
          <Link href="/dashboard/settings/homepage">Configuración portada</Link>
          <Link href="/dashboard/websites">Sitios web</Link>
          {user && user.role === 'admin' && (
            <Link href="/dashboard/users">Usuarios</Link>
          )}
        </nav>

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

      {/* MAIN */}
      <main className="flex-1 p-6">
        {children}
      </main>

    </div>
  );
}