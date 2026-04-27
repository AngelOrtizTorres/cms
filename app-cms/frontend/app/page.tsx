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
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 w-96 shadow rounded">
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