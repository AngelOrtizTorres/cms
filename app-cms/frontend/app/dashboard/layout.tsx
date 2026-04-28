'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { SidebarProvider } from '@/context/SidebarContext';
import SiteSidebar from '@/app/components/SiteSidebar';

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
        <SiteSidebar logout={logout} router={router} />

        {/* MAIN */}
        <main className="flex-1 p-6">
          {children}
        </main>

      </div>
    </SidebarProvider>
  );
}
