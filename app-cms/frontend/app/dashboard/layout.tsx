'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
    }
  }, [router]); // ✅ FIX ESLINT

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-900 text-white p-5 flex flex-col gap-4">
        <h2 className="text-xl font-bold mb-6">CMS Admin</h2>

        <Link href="/dashboard">Dashboard</Link>
        <Link href="/dashboard/articles">Articles</Link>
        <Link href="/dashboard/sections">Sections</Link>
        <Link href="/dashboard/tags">Tags</Link>
        <Link href="/dashboard/users">Users</Link>

        <button
          className="mt-auto text-red-400"
          onClick={() => {
            localStorage.removeItem('token');
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