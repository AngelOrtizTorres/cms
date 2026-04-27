'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const [loadingLocal, setLoadingLocal] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoadingLocal(true);
    console.log('[LoginPage] handleLogin start', { email });

    try {
      await login(email, password);
      console.log('[LoginPage] login success');
      router.push('/dashboard');

    } catch (err: unknown) {
      console.error('[LoginPage] login error', err);
      setError(err instanceof Error ? err.message : 'Credenciales incorrectas');
    } finally {
      setLoadingLocal(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow w-96">
        <h1 className="text-2xl font-bold mb-6">CMS Login</h1>

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

        {error && (
          <p className="text-red-500 mb-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={loadingLocal}
          className={`w-full py-2 rounded text-white ${loadingLocal ? 'bg-gray-400' : 'bg-blue-600'}`}
        >
          {loadingLocal ? 'Iniciando...' : 'Iniciar sesión'}
        </button>
      </form>
    </div>
  );
}