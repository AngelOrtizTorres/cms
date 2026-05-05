'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);

<<<<<<< HEAD
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoadingLocal(true);
    console.log('[RootLogin] handleLogin start', { email });
    try {
      await login(email, password);
      console.log('[RootLogin] login success');
      router.push('/dashboard');
    } catch (err: unknown) {
      console.error('[RootLogin] login error', err);
      setError(err instanceof Error ? err.message : 'Credenciales incorrectas');
    } finally {
      setLoadingLocal(false);
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-black">
      <form onSubmit={handleLogin} className="bg-black p-8 w-96 shadow rounded">
        <h1 className="text-2xl mb-4">CMS Login</h1>

        <input
          className="w-full border p-2 mb-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full border p-2 mb-3"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500 mb-3">{error}</p>}
=======
// ✅ Fetch corregido
async function getArticles(): Promise<Article[]> {
  const base =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000";
  const url = `${base.replace(/\/$/, "")}/api/articles`;

  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Error al cargar artículos: ${res.status} ${res.statusText} ${body}`,
    );
  }

  const json: ApiResponse = await res.json();

  return json.data;
}

// ✅ Página
export default async function Home() {
  const articles = await getArticles();

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-black">
      {/* HEADER */}
      <header className="w-full bg-white dark:bg-zinc-900 shadow p-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Mi Blog</h1>
          <nav className="flex gap-4 text-sm">
            <Link href="/">Inicio</Link>
            <Link href="/articles">Artículos</Link>
            <Link href="/contact">Contacto</Link>
          </nav>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 p-6">
        {/* POSTS */}
        <section className="md:col-span-2 flex flex-col gap-6">
          {articles.length === 0 && <p>No hay artículos disponibles.</p>}

          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-white dark:bg-zinc-900 p-5 rounded-xl shadow"
            >
              {article.image && (
                <Image
                  src={article.image}
                  alt={article.title}
                  width={800}
                  height={400}
                  className="rounded-lg mb-4"
                  unoptimized
                />
              )}

              <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
>>>>>>> main

        <button
          type="submit"
          disabled={loadingLocal}
          className={`w-full p-2 rounded text-white ${loadingLocal ? 'bg-gray-400' : 'bg-blue-600'}`}
        >
          {loadingLocal ? 'Iniciando...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
