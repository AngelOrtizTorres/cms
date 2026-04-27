'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUsers, UserProfile } from '@/lib/services/users';

export default function UsersPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<UserProfile[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await getUsers(token || undefined);
        setItems(response.data || []);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'No autorizado o sin permisos de admin';
        setError(message);
      }
    }

    load();
  }, [token]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Usuarios</h1>
      <p className="text-sm text-gray-600 mb-8">Esta vista consume GET /users (admin)</p>

      {error && <p className="text-red-600">{error}</p>}

      <div className="space-y-2">
        {items.map((user) => (
          <div key={user.id} className="rounded border p-4">
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
