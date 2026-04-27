'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, User } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';

export default function AuthMePage() {
  const { token } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCurrentUser(token || undefined);
        setUser(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'No autorizado';
        setError(message);
      }
    }

    load();
  }, [token]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Usuario actual</h1>
      <p className="text-sm text-gray-600 mb-8">Esta vista consume GET /auth/me</p>

      {error && <p className="text-red-600">{error}</p>}
      {user && (
        <div className="rounded border p-4">
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Nombre:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Rol:</strong> {user.role || 'sin rol'}</p>
        </div>
      )}
    </main>
  );
}
