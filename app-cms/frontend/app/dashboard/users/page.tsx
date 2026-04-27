'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUsers, UserProfile } from '@/lib/services/users';

export default function DashboardUsersPage() {
  const { token, refreshUser, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Esperar a que AuthProvider termine la inicialización
    if (authLoading) return;

    // DEBUG: mostrar estado de autenticación antes de cargar
    try {
      // eslint-disable-next-line no-console
      console.log('[users] authLoading:', authLoading, 'isAuthenticated:', isAuthenticated, 'tokenPresent:', !!token);
    } catch (e) {}

    async function load() {
      try {
        console.log('[users] solicitando /api/users...');
        const res = await getUsers(token || undefined);
        console.log('[users] getUsers response:', res);
        if (!mounted) return;
        const payload = Array.isArray(res) ? res : (res && (res.data ?? res));
        setUsers(payload || []);
      } catch (err: any) {
        console.error('Error cargando users:', err);

        // Si la API responde 401, intentar refrescar la sesión (cookie HttpOnly)
        if (err && err.status === 401) {
          setError('No autorizado. Intentando refrescar sesión...');
          try {
            await refreshUser();
            // reintentar
            const retry = await getUsers(token || undefined);
            const retryPayload = Array.isArray(retry) ? retry : (retry && (retry.data ?? retry));
            setUsers(retryPayload || []);
            setError(null);
            return;
          } catch (e) {
            // Si el refresh falla, intentar con token en localStorage (fallback)
            try {
              const localToken = typeof window !== 'undefined' ? localStorage.getItem('cms_token') : null;
              if (localToken) {
                const retry2 = await getUsers(localToken);
                const retry2Payload = Array.isArray(retry2) ? retry2 : (retry2 && (retry2.data ?? retry2));
                setUsers(retry2Payload || []);
                setError(null);
                return;
              }
            } catch (e2) {
              console.error('Fallback con token local falló:', e2);
            }

            setError('No autorizado. Redirigiendo a login...');
            setTimeout(() => router.push('/login'), 700);
            return;
          }
        }

        // Si el servidor respondió HTML u otro contenido no JSON, mostrar en consola
        if (err && err.data && err.data.raw) {
          console.error('Respuesta no JSON del servidor:', err.data.raw);
        }

        setError(err?.message || 'Error cargando usuarios');
      } finally {
        if (mounted) setLocalLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [token, authLoading]);

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

      {/* Panel de depuración rápido */}
      <div className="mb-4">
        <div className="text-sm text-gray-400">Debug: authLoading={String(authLoading)}, isAuthenticated={String(isAuthenticated)}, tokenPresent={String(!!token)}, users={users.length}</div>
        <div className="mt-2">
          <button
            onClick={async () => {
              try {
                console.log('[users] manual refreshUser + recarga');
                await refreshUser();
                // reintentar carga simple
                const res = await getUsers(token || undefined);
                console.log('[users] reintento response:', res);
                const manualPayload = Array.isArray(res) ? res : (res && (res.data ?? res));
                setUsers(manualPayload || []);
                setError(null);
              } catch (e) {
                console.error('Reintento manual falló:', e);
                setError('Reintento manual falló');
              } finally {
                setLocalLoading(false);
              }
            }}
            className="inline-block bg-gray-700 text-white px-3 py-1 rounded mr-2"
          >
            Reintentar carga
          </button>
        </div>
      </div>

      {localLoading || authLoading ? (
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
