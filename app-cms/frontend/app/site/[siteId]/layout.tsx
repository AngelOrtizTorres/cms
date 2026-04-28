'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  return (
    <div className="flex min-h-screen bg-white text-black">
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

      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
