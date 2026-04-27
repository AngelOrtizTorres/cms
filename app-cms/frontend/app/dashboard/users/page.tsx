'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUsers, UserProfile } from '@/lib/services/users';

export default function DashboardUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await getUsers(token || undefined);
        if (!mounted) return;
        setUsers(res.data || []);
      } catch (err: any) {
        setError(err?.message || 'Error cargando usuarios');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-sm text-gray-600">Lista de usuarios y acciones administrativas</p>
        </div>

        <div>
          <Link
            href="/dashboard/users/create"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Añadir usuario
          </Link>
        </div>
      </div>

      {loading ? (
        <p>Cargando usuarios...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left"><input type="checkbox" /></th>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Correo</th>
                <th className="px-4 py-2 text-left">Perfil</th>
                <th className="px-4 py-2 text-left">Entradas</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-600">No hay usuarios.</td>
                </tr>
              )}

              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3"><input type="checkbox" /></td>
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/users/${u.id}`} className="text-blue-600 hover:underline">
                      {u.name || '—'}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{u.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{u.role}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{(u as any).posts_count ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/dashboard/users/${u.id}/edit`} className="text-sm text-blue-600">Editar</Link>
                      <button
                        onClick={() => console.log('Eliminar usuario', u.id)}
                        className="text-sm text-red-600"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
