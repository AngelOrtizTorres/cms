"use client";

import React, { useEffect, useState } from "react";
import { apiGet, apiPut, apiDelete } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function UsersPage() {
  const auth = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet("/users", auth.token || undefined);
      setUsers((res as any) ?? []);
    } catch (err) {
      console.error("Error fetching users", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // only fetch when we have an auth token
    if (!auth.token) {
      setUsers([]);
      setError(null);
      return;
    }
    fetchUsers();
  }, [auth.token]);

  const handleRoleChange = async (id: number, role: string) => {
    setUpdating(id);
    try {
      await apiPut(`/users/${id}`, { role }, auth.token || undefined);
      await fetchUsers();
    } catch (err) {
      console.error("Error updating role", err);
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar usuario?")) return;
    try {
      await apiDelete(`/users/${id}`, auth.token || undefined);
      await fetchUsers();
    } catch (err) {
      console.error("Error deleting user", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Usuarios</h1>
      {!auth.token ? (
        <div className="bg-white p-4 shadow">
          <p>
            Debes iniciar sesión como administrador para ver y gestionar
            usuarios.
          </p>
        </div>
      ) : (
        <div className="bg-white p-4 shadow">
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 mb-4">
              <h2 className="font-semibold mb-2">## Error Type</h2>
              <div className="mb-2">Console Error</div>
              <h3 className="font-semibold">## Error Message</h3>
              <pre className="whitespace-pre-wrap text-sm bg-white p-2 border rounded">
                {`Error fetching users ${JSON.stringify(error, null, 2)}

    at fetchUsers (app/dashboard/users/page.tsx:19:15)

## Code Frame
  17 |       setUsers((res as any) ?? []);
  18 |     } catch (err) {
> 19 |       console.error('Error fetching users', err);
     |               ^
  20 |     } finally {
  21 |       setLoading(false);
  22 |     }
`}
              </pre>
            </div>
          )}
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left">
                <th className="px-2 py-1">ID</th>
                <th className="px-2 py-1">Nombre</th>
                <th className="px-2 py-1">Email</th>
                <th className="px-2 py-1">Rol</th>
                <th className="px-2 py-1">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-4">
                    Cargando...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4">
                    No hay usuarios
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="px-2 py-2">{u.id}</td>
                    <td className="px-2 py-2">{u.name}</td>
                    <td className="px-2 py-2">{u.email}</td>
                    <td className="px-2 py-2">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={updating === u.id}
                      >
                        <option value="admin">admin</option>
                        <option value="author">author</option>
                        <option value="editor">editor</option>
                        <option value="user">user</option>
                      </select>
                    </td>
                    <td className="px-2 py-2 space-x-2">
                      <button
                        className="text-sm px-2 py-1 bg-red-100"
                        onClick={() => handleDelete(u.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
